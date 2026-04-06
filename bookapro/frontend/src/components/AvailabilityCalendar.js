import React, { useState, useEffect, useCallback } from 'react';
import availabilityService from '../services/availabilityService';
import listingService from '../services/listingService';
import { useAuth } from '../context/AuthContext';

const AvailabilityCalendar = ({ listingId }) => {
  const { user, isAuthenticated } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [listing, setListing] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeSlots] = useState(['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
  const [isOwner, setIsOwner] = useState(false);

  // Load listing to check ownership
  useEffect(() => {
    const loadListing = async () => {
      try {
        const listingData = await listingService.getOne(listingId);
        setListing(listingData);
        // Check if current user is the owner of this listing
        const isListingOwner = isAuthenticated && user && listingData.provider?._id === user.id;
        setIsOwner(isListingOwner);
        console.log('Is owner:', isListingOwner, 'User:', user?.id, 'Provider:', listingData.provider?._id);
      } catch (error) {
        console.error('Error loading listing:', error);
      }
    };
    loadListing();
  }, [listingId, user, isAuthenticated]);

  const loadAvailability = useCallback(async () => {
    try {
      const data = await availabilityService.getListingAvailability(listingId);
      setAvailability(data);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  }, [listingId]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const formatDateKey = (date) => {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayStatus = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayAvailability = availability.filter(a => {
      const availDate = formatDateKey(a.date);
      return availDate === dateStr;
    });
    
    if (dayAvailability.length === 0) return 'unset';
    
    const availableSlots = dayAvailability.filter(a => a.status === 'available');
    if (availableSlots.length > 0) return 'available';
    
    return 'booked';
  };

  const getAvailableTimeSlots = (dateStr) => {
    const dayAvailability = availability.filter(a => {
      const availDate = formatDateKey(a.date);
      return availDate === dateStr && a.status === 'available';
    });
    return dayAvailability.map(a => a.timeSlot);
  };

  const handleDateClick = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedTime('');
    setMessage('');
    setShowModal(true);
  };

  const handleProviderUpdate = async (timeSlot, isCurrentlyAvailable) => {
    const newStatus = isCurrentlyAvailable ? 'unavailable' : 'available';
    
    try {
      await availabilityService.updateAvailability(listingId, selectedDate, timeSlot, newStatus);
      await loadAvailability();
      alert(`Time slot ${timeSlot} marked as ${newStatus} for ${selectedDate}!`);
    } catch (error) {
      console.error('Error updating availability:', error);
      alert(error.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleBooking = async () => {
    if (!selectedTime) {
      alert('Please select a time slot');
      return;
    }
    
    try {
      await availabilityService.bookService({
        listingId: listingId,
        providerId: listing?.provider?._id,
        date: selectedDate,
        timeSlot: selectedTime,
        message
      });
      setShowModal(false);
      setSelectedTime('');
      setMessage('');
      await loadAvailability();
      alert('Booking request sent successfully!');
    } catch (error) {
      console.error('Error booking:', error);
      alert(error.response?.data?.message || 'Failed to book');
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const status = getDayStatus(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    let statusClass = '';
    let statusText = '';
    
    if (status === 'available') {
      statusClass = 'available';
      statusText = 'Available';
    } else if (status === 'booked') {
      statusClass = 'booked';
      statusText = 'Booked';
    }
    
    days.push(
      <div 
        key={day} 
        className={`calendar-day ${statusClass}`} 
        onClick={() => handleDateClick(currentMonth.getFullYear(), currentMonth.getMonth(), day)}
      >
        {day}
        {statusText && <span className="badge">{statusText}</span>}
      </div>
    );
  }

  const allTimeSlotsForDate = availability.filter(a => {
    if (!selectedDate) return false;
    const availDate = formatDateKey(a.date);
    return availDate === selectedDate;
  });

  return (
    <div className="availability-calendar">
      <h4>Availability Calendar</h4>
      
      {isOwner && (
        <div style={{ background: '#e7f3ff', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
          ✅ You are the owner of this listing. Click on any date to manage availability.
        </div>
      )}
      
      {!isOwner && isAuthenticated && (
        <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
          📅 You are viewing this listing. Click on green dates to book this service.
        </div>
      )}

      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>←</button>
        <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>→</button>
      </div>
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="calendar-days">{days}</div>
      
      <p className="calendar-hint">
        {isOwner 
          ? '💡 Click on any date to set availability for specific time slots (only you can do this)'
          : '💡 Click on green dates to see available time slots and book'}
      </p>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h3>{isOwner ? 'Set Availability' : 'Book Service'}</h3>
            <p><strong>Date:</strong> {selectedDate}</p>
            
            {isOwner ? (
              <div>
                <h4>Time Slots</h4>
                <div className="time-slots-grid">
                  {timeSlots.map(slot => {
                    const existing = allTimeSlotsForDate.find(a => a.timeSlot === slot);
                    const isAvailable = existing?.status === 'available';
                    const isBooked = existing?.status === 'booked';
                    
                    return (
                      <div key={slot} className={`time-slot-item ${isAvailable ? 'available' : ''} ${isBooked ? 'booked' : ''}`}>
                        <span>{slot}</span>
                        {!isBooked && (
                          <button onClick={() => handleProviderUpdate(slot, isAvailable)}>
                            {isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                          </button>
                        )}
                        {isBooked && <span className="booked-label">Booked</span>}
                      </div>
                    );
                  })}
                </div>
                <button className="modal-close" onClick={() => setShowModal(false)}>Close</button>
              </div>
            ) : (
              <div>
                <h4>Select Time Slot</h4>
                {selectedDate && getAvailableTimeSlots(selectedDate).length === 0 ? (
                  <p className="no-slots">No available time slots for this date. Please check another date.</p>
                ) : (
                  <div className="time-slots-grid">
                    {selectedDate && getAvailableTimeSlots(selectedDate).map(slot => (
                      <div key={slot} className="time-slot-option">
                        <input
                          type="radio"
                          id={`slot-${slot}`}
                          name="timeSlot"
                          value={slot}
                          checked={selectedTime === slot}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        />
                        <label htmlFor={`slot-${slot}`}>{slot}</label>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedTime && (
                  <>
                    <textarea 
                      placeholder="Any special requests? (optional)" 
                      value={message} 
                      onChange={e => setMessage(e.target.value)} 
                      rows="3"
                      className="booking-message"
                    />
                    <button className="confirm-btn" onClick={handleBooking}>
                      Confirm Booking
                    </button>
                  </>
                )}
                <button className="modal-close" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;