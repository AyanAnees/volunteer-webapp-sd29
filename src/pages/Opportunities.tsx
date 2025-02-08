import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaMapMarkerAlt, FaClock, FaFilter } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { theme } from '../styles/theme';
import { 
  Container, 
  Title, 
  Card, 
  Grid, 
  Badge,
  Input,
  Select,
  Flex
} from '../components/ui/StyledComponents';

const SearchContainer = styled.div`
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  margin-bottom: ${theme.spacing.xl};
`;

const SearchInputWrapper = styled.div`
  position: relative;
  margin-bottom: ${theme.spacing.md};
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
  display: flex;
  align-items: center;
`;

const StyledInput = styled(Input)`
  padding-left: 2.5rem;
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const FilterItem = styled.div`
  flex: 1;
  min-width: 150px;
`;

const OpportunityCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const CardImage = styled.div<{ imageUrl: string }>`
  height: 180px;
  background-image: url(${props => props.imageUrl || 'https://via.placeholder.com/300x180?text=Volunteer+Opportunity'});
  background-size: cover;
  background-position: center;
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
`;

const CardContent = styled.div`
  padding: ${theme.spacing.lg};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled(Link)`
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  color: ${theme.colors.gray[800]};
  margin-bottom: ${theme.spacing.sm};
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const CardMeta = styled.div`
  margin-top: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.sm};
  margin-bottom: ${theme.spacing.xs};
`;

const CardDescription = styled.p`
  color: ${theme.colors.gray[700]};
  margin-bottom: ${theme.spacing.md};
  flex: 1;
  
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

const Tag = styled.span`
  background-color: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[700]};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.xs};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${theme.colors.gray[200]};
  padding-top: ${theme.spacing.md};
  margin-top: auto;
`;

const OrganizationName = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

const ViewButton = styled(Link)`
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: ${theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']} 0;
`;

const NoResultsTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.gray[700]};
`;

const NoResultsText = styled.p`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.lg};
`;

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        // This is a simplified query
        let query = supabase
          .from('events')
          .select(`
            *,
            creator:profiles(id, display_name, type),
            event_skills(
              skills(id, name, category)
            )
          `)
          .in('status', ['published', 'active']);

        // Apply search filter
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Apply date filter
        if (dateFilter === 'upcoming') {
          query = query.gte('start_datetime', new Date().toISOString());
        } else if (dateFilter === 'today') {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          query = query
            .gte('start_datetime', today.toISOString())
            .lt('start_datetime', tomorrow.toISOString());
        } else if (dateFilter === 'week') {
          const today = new Date();
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          query = query
            .gte('start_datetime', today.toISOString())
            .lt('start_datetime', nextWeek.toISOString());
        }

        // Apply sorting
        if (sortBy === 'date') {
          query = query.order('start_datetime', { ascending: true });
        } else if (sortBy === 'title') {
          query = query.order('title', { ascending: true });
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // For now, we'll populate with sample data if no data is returned or in development
        if (!data || data.length === 0) {
          setOpportunities(generateSampleOpportunities());
        } else {
          setOpportunities(data);
        }
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        setOpportunities(generateSampleOpportunities());
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, [searchTerm, sortBy, dateFilter, categoryFilter, locationFilter]);

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

  // Generate sample opportunities for testing/demo
  const generateSampleOpportunities = () => {
    return [
      {
        id: '1',
        title: 'Community Garden Cleanup',
        description: 'Help us clean up and prepare the community garden for spring planting. No experience necessary! We need volunteers to help with weeding, mulching, and preparing garden beds.',
        start_datetime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        end_datetime: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(), // 3 days + 3 hours
        location: 'Main Street Community Garden',
        image_url: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2681&q=80',
        creator: { display_name: 'Green Earth Initiative' },
        event_skills: [
          { skills: { name: 'Gardening', category: 'Outdoors' } },
          { skills: { name: 'Physical Labor', category: 'General' } },
        ]
      },
      {
        id: '2',
        title: 'Homeless Shelter Meal Service',
        description: 'Volunteers needed to help prepare and serve meals at the downtown homeless shelter. We serve dinner to approximately 100 people each night and need help with preparation, serving, and cleanup.',
        start_datetime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        end_datetime: new Date(Date.now() + 86400000 * 5 + 14400000).toISOString(), // 5 days + 4 hours
        location: 'Hope Street Shelter',
        image_url: 'https://images.unsplash.com/photo-1541802645635-11f2286a7482?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
        creator: { display_name: 'Community Outreach Network' },
        event_skills: [
          { skills: { name: 'Cooking', category: 'Food' } },
          { skills: { name: 'Food Service', category: 'Food' } },
        ]
      },
      {
        id: '3',
        title: 'After-School Tutoring Program',
        description: 'Tutor elementary school students in math and reading. Training provided for volunteers. We need committed volunteers who can dedicate at least one afternoon per week for the semester.',
        start_datetime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        end_datetime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(), // 2 days + 2 hours
        location: 'Washington Elementary School',
        image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2622&q=80',
        creator: { display_name: 'Education for All Foundation' },
        event_skills: [
          { skills: { name: 'Teaching', category: 'Education' } },
          { skills: { name: 'Patience', category: 'Personal' } },
          { skills: { name: 'Math', category: 'Education' } },
        ]
      },
      {
        id: '4',
        title: 'Animal Shelter Dog Walking',
        description: 'Help exercise our shelter dogs by taking them for walks. This is a great opportunity for animal lovers! Regular dog walkers are needed to ensure all our dogs get adequate exercise.',
        start_datetime: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
        end_datetime: new Date(Date.now() + 86400000 * 1 + 7200000).toISOString(), // 1 day + 2 hours
        location: 'Paws and Claws Animal Shelter',
        image_url: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
        creator: { display_name: 'Animal Rescue League' },
        event_skills: [
          { skills: { name: 'Animal Care', category: 'Animals' } },
          { skills: { name: 'Physical Activity', category: 'Outdoors' } },
        ]
      },
      {
        id: '5',
        title: 'Beach Cleanup Initiative',
        description: 'Join us for a day of cleaning our local beach. All equipment will be provided. Help us protect marine life and keep our beaches beautiful for everyone to enjoy.',
        start_datetime: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
        end_datetime: new Date(Date.now() + 86400000 * 7 + 10800000).toISOString(), // 7 days + 3 hours
        location: 'Sunset Beach',
        image_url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
        creator: { display_name: 'Ocean Conservancy Group' },
        event_skills: [
          { skills: { name: 'Environmental Conservation', category: 'Environment' } },
          { skills: { name: 'Physical Labor', category: 'General' } },
        ]
      },
      {
        id: '6',
        title: 'Senior Center Tech Support',
        description: 'Provide technical support and training to seniors learning to use computers, smartphones, and tablets. Help bridge the digital divide and empower seniors with technology skills.',
        start_datetime: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
        end_datetime: new Date(Date.now() + 86400000 * 4 + 7200000).toISOString(), // 4 days + 2 hours
        location: 'Golden Years Senior Center',
        image_url: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2630&q=80',
        creator: { display_name: 'Digital Access Foundation' },
        event_skills: [
          { skills: { name: 'Technology', category: 'Tech' } },
          { skills: { name: 'Teaching', category: 'Education' } },
          { skills: { name: 'Patience', category: 'Personal' } },
        ]
      },
    ];
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Loading opportunities...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Volunteer Opportunities</Title>
      
      <SearchContainer>
        <SearchInputWrapper>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <StyledInput 
            placeholder="Search for volunteer opportunities..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInputWrapper>
        
        <FilterBar>
          <FilterItem>
            <Select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Name</option>
            </Select>
          </FilterItem>
          
          <FilterItem>
            <Select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="upcoming">All Upcoming</option>
            </Select>
          </FilterItem>
          
          <FilterItem>
            <Select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="education">Education</option>
              <option value="environment">Environment</option>
              <option value="food">Food & Hunger</option>
              <option value="health">Health & Wellness</option>
              <option value="animals">Animals</option>
            </Select>
          </FilterItem>
          
          <FilterItem>
            <Select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="local">Near Me</option>
              <option value="remote">Remote Only</option>
            </Select>
          </FilterItem>
        </FilterBar>
      </SearchContainer>
      
      {opportunities.length > 0 ? (
        <Grid columns={3} gap={theme.spacing.xl}>
          {opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id}>
              <CardImage imageUrl={opportunity.image_url} />
              
              <CardContent>
                <CardTitle to={`/opportunities/${opportunity.id}`}>
                  {opportunity.title}
                </CardTitle>
                
                <CardMeta>
                  <MetaItem>
                    <FaClock size={14} />
                    {formatDate(opportunity.start_datetime)}
                  </MetaItem>
                  <MetaItem>
                    <FaMapMarkerAlt size={14} />
                    {opportunity.location}
                  </MetaItem>
                </CardMeta>
                
                <CardDescription>
                  {opportunity.description}
                </CardDescription>
                
                <TagsContainer>
                  {opportunity.event_skills?.map((skillItem: any, index: number) => (
                    <Tag key={index}>
                      {skillItem.skills.name}
                    </Tag>
                  ))}
                </TagsContainer>
                
                <CardFooter>
                  <OrganizationName>
                    {opportunity.creator?.display_name || 'Organization'}
                  </OrganizationName>
                  <ViewButton to={`/opportunities/${opportunity.id}`}>
                    View Details →
                  </ViewButton>
                </CardFooter>
              </CardContent>
            </OpportunityCard>
          ))}
        </Grid>
      ) : (
        <NoResults>
          <NoResultsTitle>No opportunities found</NoResultsTitle>
          <NoResultsText>
            Try adjusting your search criteria to find more volunteer opportunities.
          </NoResultsText>
          <Flex justify="center">
            <button 
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
                setCategoryFilter('all');
                setLocationFilter('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.primary,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <FaFilter style={{ marginRight: '8px' }} />
              Clear all filters
            </button>
          </Flex>
        </NoResults>
      )}
    </Container>
  );
}
