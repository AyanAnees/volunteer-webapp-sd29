import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTimes, FaPlus, FaImage, FaCalendarAlt, FaMapMarkerAlt, FaUserFriends } from 'react-icons/fa';
import { supabase, getCurrentProfile } from '../lib/supabase';
import { theme } from '../styles/theme';
import { 
  Container, 
  Title,
  Card,
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  PrimaryButton,
  SecondaryButton,
  ErrorMessage,
  Flex,
  Grid
} from '../components/ui/StyledComponents';

// Styled Components
const EventCreateContainer = styled(Container)`
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const FormCard = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
`;

const FormTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const SkillTag = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  background-color: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  margin-right: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.gray[600]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes.lg};
  padding: 0;
  
  &:hover {
    color: ${theme.colors.error};
  }
`;

const AddButton = styled(PrimaryButton)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const ImagePreview = styled.div<{ url: string }>`
  width: 100%;
  height: 200px;
  background-image: ${props => props.url ? `url(${props.url})` : 'none'};
  background-size: cover;
  background-position: center;
  background-color: ${theme.colors.gray[100]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray[500]};
  font-size: ${theme.fontSizes.xl};
`;

const ImportanceLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  
  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(Card)`
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const ModalTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  
  &:hover {
    color: ${theme.colors.gray[700]};
  }
`;

// Component
export default function EventCreate() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);
  const [currentSkill, setCurrentSkill] = useState<string>('');
  const [currentImportance, setCurrentImportance] = useState<string>('1');
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_datetime: '',
    end_datetime: '',
    max_volunteers: '10',
    min_volunteers: '1',
    image_url: '',
    status: 'draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check access on component mount
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const profile = await getCurrentProfile();
        
        // Redirect if not an organization or admin
        if (!profile || (profile.type !== 'organization' && profile.type !== 'admin')) {
          alert('Only organizations can create events.');
          navigate('/');
          return;
        }
        
        setUserProfile(profile);

        // Fetch available skills
        const { data: skills, error: skillsError } = await supabase
          .from('skills')
          .select('*')
          .order('name');

        if (skillsError) throw skillsError;
        setAllSkills(skills || []);
      } catch (error) {
        console.error('Error checking access:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle number input changes
  const handleNumberInputChange = (name: string, value: string) => {
    // Convert to number and back to string to validate
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData({
        ...formData,
        [name]: numValue.toString(),
      });
    } else if (value === '') {
      setFormData({
        ...formData,
        [name]: '',
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Add skill to selected skills
  const addSkill = () => {
    if (!currentSkill) return;
    
    // Find the selected skill object
    const skillObj = allSkills.find(skill => skill.id === currentSkill);
    if (!skillObj) return;
    
    // Add to selected skills with importance level
    if (!selectedSkills.some(s => s.id === currentSkill)) {
      setSelectedSkills([
        ...selectedSkills,
        {
          ...skillObj,
          importance_level: parseInt(currentImportance),
        },
      ]);
    }
    
    // Reset form
    setCurrentSkill('');
    setCurrentImportance('1');
    setIsSkillModalOpen(false);
  };

  // Remove skill from selected skills
  const removeSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill.id !== skillId));
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.start_datetime) newErrors.start_datetime = 'Start date/time is required';
    if (!formData.end_datetime) newErrors.end_datetime = 'End date/time is required';
    
    // Validate that end time is after start time
    if (formData.start_datetime && formData.end_datetime) {
      const start = new Date(formData.start_datetime);
      const end = new Date(formData.end_datetime);
      if (end <= start) {
        newErrors.end_datetime = 'End time must be after start time';
      }
    }
    
    // Validate volunteer counts
    const minVolunteers = parseInt(formData.min_volunteers);
    const maxVolunteers = parseInt(formData.max_volunteers);
    
    if (isNaN(minVolunteers) || minVolunteers < 1) {
      newErrors.min_volunteers = 'Minimum volunteers must be at least 1';
    }
    
    if (maxVolunteers && minVolunteers > maxVolunteers) {
      newErrors.max_volunteers = 'Maximum volunteers must be greater than or equal to minimum';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Insert event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          creator_id: userProfile.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          start_datetime: formData.start_datetime,
          end_datetime: formData.end_datetime,
          max_volunteers: formData.max_volunteers ? parseInt(formData.max_volunteers) : null,
          min_volunteers: parseInt(formData.min_volunteers),
          image_url: formData.image_url,
          status: formData.status,
        })
        .select()
        .single();
      
      if (eventError) throw eventError;
      
      // Insert event skills
      if (selectedSkills.length > 0) {
        const eventSkillsData = selectedSkills.map(skill => ({
          event_id: eventData.id,
          skill_id: skill.id,
          importance_level: skill.importance_level,
        }));
        
        const { error: skillsError } = await supabase
          .from('event_skills')
          .insert(eventSkillsData);
        
        if (skillsError) throw skillsError;
      }
      
      alert(formData.status === 'published' 
        ? 'Your event has been published successfully!' 
        : 'Your event has been saved as a draft.');
      
      navigate(`/opportunities/${eventData.id}`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(`Failed to create event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <EventCreateContainer>
      <Flex justify="space-between" align="center" style={{ marginBottom: theme.spacing.lg }}>
        <Title>Create New Volunteer Opportunity</Title>
      </Flex>

      <form onSubmit={handleSubmit}>
        <FormCard>
          <FormTitle>Basic Information</FormTitle>
          <Grid columns={1} gap={theme.spacing.md}>
            <FormGroup>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Give your event a clear, descriptive title"
              />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what volunteers will be doing, what impact they'll make, and any specific requirements"
                rows={6}
              />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
            </FormGroup>
          </Grid>
        </FormCard>

        <Grid columns={2} gap={theme.spacing.lg}>
          <FormCard>
            <FormTitle>Event Details</FormTitle>
            <Grid columns={1} gap={theme.spacing.md}>
              <FormGroup>
                <Label htmlFor="location">
                  <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Where will this event take place?"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="start_datetime">
                  <FaCalendarAlt style={{ marginRight: '8px' }} />
                  Start Date & Time
                </Label>
                <Input
                  id="start_datetime"
                  name="start_datetime"
                  type="datetime-local"
                  value={formData.start_datetime}
                  onChange={handleInputChange}
                />
                {errors.start_datetime && <ErrorMessage>{errors.start_datetime}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="end_datetime">
                  <FaCalendarAlt style={{ marginRight: '8px' }} />
                  End Date & Time
                </Label>
                <Input
                  id="end_datetime"
                  name="end_datetime"
                  type="datetime-local"
                  value={formData.end_datetime}
                  onChange={handleInputChange}
                />
                {errors.end_datetime && <ErrorMessage>{errors.end_datetime}</ErrorMessage>}
              </FormGroup>

              <Grid columns={2} gap={theme.spacing.md}>
                <FormGroup>
                  <Label htmlFor="min_volunteers">
                    <FaUserFriends style={{ marginRight: '8px' }} />
                    Minimum Volunteers
                  </Label>
                  <Input
                    id="min_volunteers"
                    type="number"
                    min={1}
                    value={formData.min_volunteers}
                    onChange={(e) => handleNumberInputChange('min_volunteers', e.target.value)}
                  />
                  {errors.min_volunteers && <ErrorMessage>{errors.min_volunteers}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="max_volunteers">
                    <FaUserFriends style={{ marginRight: '8px' }} />
                    Maximum Volunteers
                  </Label>
                  <Input
                    id="max_volunteers"
                    type="number"
                    min={parseInt(formData.min_volunteers)}
                    value={formData.max_volunteers}
                    onChange={(e) => handleNumberInputChange('max_volunteers', e.target.value)}
                  />
                  {errors.max_volunteers && <ErrorMessage>{errors.max_volunteers}</ErrorMessage>}
                </FormGroup>
              </Grid>
            </Grid>
          </FormCard>

          <FormCard>
            <FormTitle>Media & Additional Details</FormTitle>
            <Grid columns={1} gap={theme.spacing.md}>
              <FormGroup>
                <Label htmlFor="image_url">
                  <FaImage style={{ marginRight: '8px' }} />
                  Event Image
                </Label>
                <ImagePreview url={formData.image_url}>
                  {!formData.image_url && <FaImage />}
                </ImagePreview>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="URL to an image representing this event"
                />
              </FormGroup>

              <FormGroup>
                <Label>Required Skills</Label>
                <SkillsContainer>
                  {selectedSkills.length > 0 ? (
                    selectedSkills.map(skill => (
                      <SkillTag key={skill.id}>
                        {skill.name}
                        {skill.importance_level > 1 && ` (Level ${skill.importance_level})`}
                        <RemoveButton onClick={() => removeSkill(skill.id)}>
                          <FaTimes />
                        </RemoveButton>
                      </SkillTag>
                    ))
                  ) : (
                    <div style={{ color: theme.colors.gray[500], marginBottom: theme.spacing.sm }}>
                      No skills selected yet
                    </div>
                  )}
                </SkillsContainer>
                <AddButton type="button" onClick={() => setIsSkillModalOpen(true)}>
                  <FaPlus />
                  Add Skill
                </AddButton>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="status">Event Status</Label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">Save as Draft</option>
                  <option value="published">Publish Immediately</option>
                </Select>
              </FormGroup>
            </Grid>
          </FormCard>
        </Grid>

        <Flex justify="flex-end" gap={theme.spacing.md} style={{ marginTop: theme.spacing.xl }}>
          <SecondaryButton type="button" onClick={() => navigate('/opportunities')}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </PrimaryButton>
        </Flex>
      </form>

      {/* Skill Selection Modal */}
      {isSkillModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add Required Skill</ModalTitle>
              <CloseButton onClick={() => setIsSkillModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            
            <FormGroup>
              <Label htmlFor="skill">Select Skill</Label>
              <Select
                id="skill"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
              >
                <option value="">Choose a skill</option>
                {allSkills
                  .filter(skill => !selectedSkills.some(s => s.id === skill.id))
                  .map(skill => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} {skill.category && `(${skill.category})`}
                    </option>
                  ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Importance Level</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                <ImportanceLabel>
                  <input
                    type="radio"
                    name="importance"
                    value="1"
                    checked={currentImportance === '1'}
                    onChange={() => setCurrentImportance('1')}
                  />
                  Preferred (Nice to have)
                </ImportanceLabel>
                <ImportanceLabel>
                  <input
                    type="radio"
                    name="importance"
                    value="2"
                    checked={currentImportance === '2'}
                    onChange={() => setCurrentImportance('2')}
                  />
                  Important (Strongly preferred)
                </ImportanceLabel>
                <ImportanceLabel>
                  <input
                    type="radio"
                    name="importance"
                    value="3"
                    checked={currentImportance === '3'}
                    onChange={() => setCurrentImportance('3')}
                  />
                  Required (Must have)
                </ImportanceLabel>
              </div>
            </FormGroup>

            <Flex justify="flex-end" gap={theme.spacing.md} style={{ marginTop: theme.spacing.lg }}>
              <SecondaryButton type="button" onClick={() => setIsSkillModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton 
                type="button" 
                onClick={addSkill} 
                disabled={!currentSkill}
              >
                Add Skill
              </PrimaryButton>
            </Flex>
          </ModalContent>
        </ModalOverlay>
      )}
    </EventCreateContainer>
  );
}
