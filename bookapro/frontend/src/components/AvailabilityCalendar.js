import React, { useState, useEffect, useCallback } from 'react';
import availabilityService from '../services/availabilityService';
import listingService from '../services/listingService';
import { useAuth } from '../context/AuthContext';

// AvailabilityCalendar Component - Displays calendar for booking or managing availability
// Shows green dates for available slots, red for booked, allows booking or management based on user role
const AvailabilityCalendar = ({ listingId }) => {
  const { user, isAuthenticated } = useAuth();
  const [availability, setAvailability] = useState([]);        // List of availability slots
  const [listing, setListing] = useState(null);                // Current listing data
  const [selectedDate, setSelectedDate] = useState(null);      // Date user clicked on
  const [selectedTime, setSelectedTime] = useState('');        // Selected time slot for booking
  const [message, setMessage] = useState('');                  // Optional message from customer
  const [showModal, setShowModal] = useState(false);           // Show time slot modal
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current calendar month
  const [timeSlots] = useState(['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
  const [isOwner, setIsOwner] = useState(false);               // Whether current user owns this listing

  // Load listing to check if current user is the owner
  useEffect(() => {
    const loadListing = async () => {
      try {
        const listingData = await listingService.getOne(listingId);
        setListing(listingData);
        const isListingOwner = isAuthenticated && user && listingData.provider?._id === user.id;
        setIsOwner(isListingOwner);
      } catch (error) {
        console.error('Error loading listing:', error);
      }
    };
    loadListing();
  }, [listingId, user, isAuthenticated]);

  // Load availability data for this listing
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

  // Format date to YYYY-MM-DD string for comparison
  const formatDateKey = (date) => {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Determine status of a specific day (available, booked, or unset)
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

  // Get list of available time slots for a specific date
  const getAvailableTimeSlots = (dateStr) => {
    const dayAvailability = availability.filter(a => {
      const availDate = formatDateKey(a.date);
      return availDate === dateStr && a.status === 'available';
    });
    return dayAvailability.map(a => a.timeSlot);
  };

  // Handle clicking on a date - opens modal for booking or management
  const handleDateClick = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedTime('');
    setMessage('');
    setShowModal(true);
  };

  // Provider updates availability for a time slot
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

  // Customer books a time slot
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

  // Calendar generation helpers
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add actual days of the month
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

  // Get all time slots for the selected date
  const allTimeSlotsForDate = availability.filter(a => {
    if (!selectedDate) return false;
    const availDate = formatDateKey(a.date);
    return availDate === selectedDate;
  });

  return (
    <div className="availability-calendar">
      <h4>Availability Calendar</h4>
      
      {/* Owner notification banner */}
      {isOwner && (
        <div style={{ background: '#e7f3ff', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
          ✅ You are the owner of this listing. Click on any date to manage availability.
        </div>
      )}
      
      {/* Customer notification banner */}
      {!isOwner && isAuthenticated && (
        <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
          📅 You are viewing this listing. Click on green dates to book this service.
        </div>
      )}

      {/* Calendar header with month navigation */}
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>←</button>
        <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>→</button>
      </div>
      
      {/* Weekday headers */}
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>
      
      {/* Calendar days grid */}
      <div className="calendar-days">{days}</div>
      
      {/* Hint text based on user role */}
      <p className="calendar-hint">
        {isOwner 
          ? '💡 Click on any date to set availability for specific time slots (only you can do this)'
          : '💡 Click on green dates to see available time slots and book'}
      </p>

      {/* Modal for time slot selection (owner view or customer view) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h3>{isOwner ? 'Set Availability' : 'Book Service'}</h3>
            <p><strong>Date:</strong> {selectedDate}</p>
            
            {isOwner ? (
              // Owner view - manage time slots
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
              // Customer view - book time slot
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
                
                {/* Show message box only after time slot is selected */}
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