import React, { useState } from 'react';
import styled from 'styled-components';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import { theme } from '../../styles/theme';

export interface CalendarEvent {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  status: string;
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const CalendarContainer = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.primary};
  color: white;
`;

const MonthTitle = styled.h2`
  margin: 0;
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
`;

const NavigationButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: ${theme.fontSizes.xl};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: ${theme.colors.gray[100]};
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const Weekday = styled.div`
  text-align: center;
  font-weight: 600;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[700]};
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, auto);
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-auto-rows: minmax(80px, auto);
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-auto-rows: minmax(60px, auto);
  }
`;

const Day = styled.div<{ isCurrentMonth: boolean; isToday: boolean }>`
  padding: ${theme.spacing.xs};
  border-right: 1px solid ${theme.colors.gray[200]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background-color: ${props => props.isToday ? theme.colors.primary + '10' : 'white'};
  color: ${props => props.isCurrentMonth ? theme.colors.gray[800] : theme.colors.gray[400]};
  position: relative;
  
  &:nth-child(7n) {
    border-right: none;
  }
`;

const DayNumber = styled.div<{ isToday: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  font-weight: ${props => props.isToday ? 600 : 400};
  background-color: ${props => props.isToday ? theme.colors.primary : 'transparent'};
  color: ${props => props.isToday ? 'white' : 'inherit'};
  margin-bottom: ${theme.spacing.xs};
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

const EventItem = styled(Link)<{ status: string }>`
  display: block;
  font-size: ${theme.fontSizes.xs};
  padding: 2px 4px;
  border-radius: ${theme.borderRadius.sm};
  background-color: ${props => {
    switch (props.status) {
      case 'active': return theme.colors.primary + '30';
      case 'completed': return theme.colors.success + '30';
      case 'cancelled': return theme.colors.error + '30';
      default: return theme.colors.gray[200];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return theme.colors.primary;
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.gray[700];
    }
  }};
  text-decoration: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  border-left: 3px solid ${props => {
    switch (props.status) {
      case 'active': return theme.colors.primary;
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.gray[400];
    }
  }};
  
  &:hover {
    filter: brightness(0.95);
  }
`;

const MoreEvents = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.gray[600]};
  text-align: center;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NoEventsMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: ${theme.colors.gray[500]};
  gap: ${theme.spacing.md};
`;

const EventCalendar: React.FC<EventCalendarProps> = ({ events, onEventClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a full calendar grid (including days from previous/next months)
  const createCalendarDays = () => {
    const firstDayOfMonth = monthStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const lastDayOfMonth = monthEnd.getDay();
    
    // Add days from previous month
    const prevMonthDays = [];
    if (firstDayOfMonth > 0) {
      const prevMonth = subMonths(monthStart, 1);
      const prevMonthEnd = endOfMonth(prevMonth);
      
      const daysToAdd = firstDayOfMonth;
      for (let i = daysToAdd - 1; i >= 0; i--) {
        const day = new Date(prevMonthEnd);
        day.setDate(prevMonthEnd.getDate() - i);
        prevMonthDays.push(day);
      }
    }
    
    // Add days from next month
    const nextMonthDays = [];
    if (lastDayOfMonth < 6) {
      const daysToAdd = 6 - lastDayOfMonth;
      const nextMonth = addMonths(monthStart, 1);
      
      for (let i = 1; i <= daysToAdd; i++) {
        const day = new Date(nextMonth);
        day.setDate(i);
        nextMonthDays.push(day);
      }
    }
    
    return [...prevMonthDays, ...monthDays, ...nextMonthDays];
  };

  const calendarDays = createCalendarDays();

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStartDate = parseISO(event.start_datetime);
      return isSameDay(eventStartDate, day);
    });
  };

  // Format the time for display
  const formatEventTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  };

  return (
    <CalendarContainer>
      {events.length === 0 ? (
        <NoEventsMessage>
          <FaCalendarAlt size={40} color={theme.colors.gray[300]} />
          <div>No events scheduled yet</div>
        </NoEventsMessage>
      ) : (
        <>
          <CalendarHeader>
            <NavigationButton onClick={prevMonth}>
              <FaChevronLeft />
            </NavigationButton>
            <MonthTitle>{format(currentMonth, 'MMMM yyyy')}</MonthTitle>
            <NavigationButton onClick={nextMonth}>
              <FaChevronRight />
            </NavigationButton>
          </CalendarHeader>
          
          <WeekdaysRow>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Weekday key={day}>{day}</Weekday>
            ))}
          </WeekdaysRow>
          
          <DaysGrid>
            {calendarDays.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonthDay = isSameMonth(day, currentMonth);
              const isTodayFlag = isToday(day);
              
              return (
                <Day 
                  key={i} 
                  isCurrentMonth={isCurrentMonthDay}
                  isToday={isTodayFlag}
                  onClick={() => setSelectedDate(day)}
                >
                  <DayNumber isToday={isTodayFlag}>
                    {format(day, 'd')}
                  </DayNumber>
                  
                  <EventsList>
                    {dayEvents.slice(0, 2).map(event => (
                      <EventItem 
                        key={event.id}
                        to={`/opportunities/${event.id}`}
                        status={event.status}
                        onClick={(e) => {
                          if (onEventClick) {
                            e.preventDefault();
                            onEventClick(event);
                          }
                        }}
                      >
                        {formatEventTime(event.start_datetime)} {event.title}
                      </EventItem>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <MoreEvents>
                        +{dayEvents.length - 2} more
                      </MoreEvents>
                    )}
                  </EventsList>
                </Day>
              );
            })}
          </DaysGrid>
        </>
      )}
    </CalendarContainer>
  );
};

export default EventCalendar;
