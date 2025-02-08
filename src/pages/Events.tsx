import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  max-width: 400px;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const FilterControls = styled.div`
  display: flex;
  gap: 10px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
`;

const EventGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const EventCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const EventImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const EventBody = styled.div`
  padding: 15px;
`;

const EventTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 8px;
`;

const EventDate = styled.div`
  color: #3182ce;
  font-size: 0.9rem;
  margin-bottom: 10px;
`;

const EventDescription = styled.p`
  color: #666;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
`;

const Tag = styled.span`
  background-color: #e6f7ff;
  color: #0070f3;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const EventFooter = styled.div`
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OrganizerInfo = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const EventLocation = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ViewButton = styled(Link)`
  color: #3182ce;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
`;

const EmptyMessage = styled.p`
  margin-bottom: 20px;
  color: #666;
`;

const Button = styled.button`
  background-color: #3182ce;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #2b6cb0;
  }
`;

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // This is a simplified query without the joins
        let query = supabase
          .from('events')
          .select('*')
          .eq('status', 'published');

        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        if (sortBy === 'date') {
          query = query.order('start_datetime', { ascending: true });
        } else if (sortBy === 'title') {
          query = query.order('title', { ascending: true });
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // For now, we'll populate with sample data if no data is returned
        if (!data || data.length === 0) {
          setEvents(generateSampleEvents());
        } else {
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents(generateSampleEvents());
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, sortBy, filterStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generate sample events for testing
  const generateSampleEvents = () => {
    return [
      {
        id: '1',
        title: 'Community Garden Cleanup',
        description: 'Help us clean up and prepare the community garden for spring planting. No experience necessary!',
        start_datetime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        end_datetime: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(), // 3 days + 3 hours
        location: 'Main Street Community Garden',
        image_url: 'https://via.placeholder.com/400x200?text=Garden+Cleanup',
        creator: { display_name: 'Green Earth Initiative' },
        event_skills: [
          { skills: { name: 'Gardening' } },
          { skills: { name: 'Physical Labor' } },
        ]
      },
      {
        id: '2',
        title: 'Homeless Shelter Meal Service',
        description: 'Volunteers needed to help prepare and serve meals at the downtown homeless shelter.',
        start_datetime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        end_datetime: new Date(Date.now() + 86400000 * 5 + 14400000).toISOString(), // 5 days + 4 hours
        location: 'Hope Street Shelter',
        image_url: 'https://via.placeholder.com/400x200?text=Meal+Service',
        creator: { display_name: 'Community Outreach Network' },
        event_skills: [
          { skills: { name: 'Cooking' } },
          { skills: { name: 'Food Service' } },
        ]
      },
      {
        id: '3',
        title: 'After-School Tutoring Program',
        description: 'Tutor elementary school students in math and reading. Training provided for volunteers.',
        start_datetime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        end_datetime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(), // 2 days + 2 hours
        location: 'Washington Elementary School',
        image_url: 'https://via.placeholder.com/400x200?text=Tutoring',
        creator: { display_name: 'Education for All Foundation' },
        event_skills: [
          { skills: { name: 'Teaching' } },
          { skills: { name: 'Patience' } },
          { skills: { name: 'Math' } },
        ]
      },
    ];
  };

  if (isLoading) {
    return (
      <Container>
        <p>Loading events...</p>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <Title>Volunteer Opportunities</Title>
      </PageHeader>

      <SearchBar>
        <SearchInputWrapper>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput 
            placeholder="Search opportunities" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInputWrapper>

        <FilterControls>
          <Select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </Select>
          
          <Select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Opportunities</option>
            <option value="upcoming">Upcoming Only</option>
          </Select>
        </FilterControls>
      </SearchBar>

      {events.length > 0 ? (
        <EventGrid>
          {events.map((event) => (
            <EventCard key={event.id}>
              <EventImage
                src={event.image_url || 'https://via.placeholder.com/400x200?text=Event'}
                alt={event.title}
              />
              <EventBody>
                <EventTitle>{event.title}</EventTitle>
                <EventDate>{formatDate(event.start_datetime)}</EventDate>
                <EventDescription>{event.description}</EventDescription>
                <TagList>
                  {event.event_skills?.slice(0, 3).map((skill: any, index: number) => (
                    <Tag key={index}>
                      {skill.skills.name}
                    </Tag>
                  ))}
                  {event.event_skills?.length > 3 && (
                    <Tag>+{event.event_skills.length - 3} more</Tag>
                  )}
                </TagList>
              </EventBody>
              <EventFooter>
                <OrganizerInfo>
                  Organized by: {event.creator?.display_name || 'Unknown'}
                </OrganizerInfo>
                <EventLocation>
                  <span>{event.location || 'No location specified'}</span>
                  <ViewButton to={`/events/${event.id}`}>View details →</ViewButton>
                </EventLocation>
              </EventFooter>
            </EventCard>
          ))}
        </EventGrid>
      ) : (
        <EmptyState>
          <EmptyMessage>No opportunities found matching your criteria.</EmptyMessage>
          <Button onClick={() => setSearchTerm('')}>
            Clear Search
          </Button>
        </EmptyState>
      )}
    </Container>
  );
}
