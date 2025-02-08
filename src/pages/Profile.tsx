import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaGlobe, 
  FaPlus, 
  FaTrash, 
  FaCamera 
} from 'react-icons/fa';
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
  Flex,
  ErrorMessage,
  Grid,
  Badge
} from '../components/ui/StyledComponents';

const ProfileContainer = styled(Container)`
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  
  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    align-items: flex-start;
    gap: ${theme.spacing.xl};
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.md}) {
    margin-bottom: 0;
  }
`;

const Avatar = styled.div<{ imageUrl?: string }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: ${theme.colors.gray[200]};
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: ${theme.colors.gray[400]};
  overflow: hidden;
`;

const AvatarUploadButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${theme.shadows.md};
  
  &:hover {
    background-color: ${theme.colors.primaryHover};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileTabs = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  margin-bottom: ${theme.spacing.lg};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.gray[700]};
  font-weight: ${props => props.active ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const SkillsContainer = styled.div`
  margin-top: ${theme.spacing.md};
`;

const SkillItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.sm};
`;

const SkillInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SkillName = styled.div`
  font-weight: 500;
`;

const SkillCategory = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.error};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const AddSkillRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const AvailabilityContainer = styled.div`
  margin-top: ${theme.spacing.md};
`;

const DayRow = styled.div`
  display: flex;
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const DayLabel = styled.div`
  width: 100px;
  font-weight: 500;
  padding: ${theme.spacing.sm} 0;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    padding-bottom: 0;
  }
`;

const TimeSlots = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  flex: 1;
`;

const TimeSlot = styled.div<{ selected: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background-color: ${props => props.selected ? theme.colors.primary : theme.colors.gray[100]};
  color: ${props => props.selected ? 'white' : theme.colors.gray[700]};
  cursor: pointer;
  font-size: ${theme.fontSizes.sm};
  
  &:hover {
    background-color: ${props => props.selected ? theme.colors.primaryHover : theme.colors.gray[200]};
  }
`;

const UserTypeTag = styled(Badge)`
  background-color: ${theme.colors.primary};
  color: white;
  text-transform: capitalize;
  margin-left: ${theme.spacing.sm};
`;

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [editMode, setEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVolunteer, setIsVolunteer] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState({
    display_name: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
  });
  
  // Skills state
  const [skills, setSkills] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('3');
  
  // Availability state
  const [availability, setAvailability] = useState<{
    [key: string]: {
      [key: string]: boolean
    }
  }>({
    Monday: {
      'Morning': false,
      'Afternoon': false,
      'Evening': false
    },
    Tuesday: {
      'Morning': false,
      'Afternoon': false,
      'Evening': false
    },
    Wednesday: {
      'Morning': false,
      'Afternoon': false,
      'Evening': false
    },
    Thursday: {
      'Morning': false,
      'Afternoon': false,
      'Evening': false
    },
    Friday: {
      'Morning': false,
      'Afternoon': false,
      'Evening': false
    },
    Saturday: {
      'Morning': false,
      'Afternoon': false,
      'Evening': false
    },
    Sunday: {
      'Morning': false,
      'Afternoon': false,
      'Evening': false
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get user profile
        const userProfile = await getCurrentProfile();
        setProfile(userProfile);
        
        if (userProfile) {
          // Set form state
          setFormState({
            display_name: userProfile.display_name || '',
            bio: userProfile.bio || '',
            location: userProfile.location || '',
            phone: userProfile.phone || '',
            website: userProfile.website || '',
          });
          
          // Check if user is a volunteer
          setIsVolunteer(userProfile.type === 'volunteer');
          
          // Fetch user skills
          if (userProfile.type === 'volunteer') {
            const { data: userSkills } = await supabase
              .from('profile_skills')
              .select(`
                id,
                proficiency_level,
                skills (
                  id,
                  name,
                  category
                )
              `)
              .eq('profile_id', userProfile.id);
              
            setSkills(userSkills || []);
            
            // Fetch all available skills
            const { data: allAvailableSkills } = await supabase
              .from('skills')
              .select('*')
              .order('name');
              
            setAllSkills(allAvailableSkills || []);
            
            // Fetch user availability
            const { data: userAvailability } = await supabase
              .from('availability')
              .select('*')
              .eq('profile_id', userProfile.id);
              
            if (userAvailability && userAvailability.length > 0) {
              // Convert database availability to UI format
              // In a real app, this would be more sophisticated
              const newAvailability = { ...availability };
              
              userAvailability.forEach(slot => {
                const day = getDayFromNumber(slot.day_of_week);
                const timeOfDay = getTimeOfDay(slot.start_time);
                
                if (day && timeOfDay) {
                  newAvailability[day][timeOfDay] = true;
                }
              });
              
              setAvailability(newAvailability);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrorMessage('Failed to load profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const getDayFromNumber = (dayNumber: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || '';
  };
  
  const getTimeOfDay = (time: string): string => {
    const hour = parseInt(time.split(':')[0], 10);
    
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 22) return 'Evening';
    
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage('');
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formState.display_name,
          bio: formState.bio,
          location: formState.location,
          phone: formState.phone,
          website: formState.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        ...formState
      }));
      
      setEditMode(false);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill || !proficiencyLevel) return;
    
    try {
      // Check if skill already exists
      const exists = skills.some(skill => skill.skills.id === selectedSkill);
      
      if (exists) {
        setErrorMessage('You already have this skill in your profile.');
        return;
      }
      
      // Add skill to database
      const { data, error } = await supabase
        .from('profile_skills')
        .insert({
          profile_id: profile.id,
          skill_id: selectedSkill,
          proficiency_level: parseInt(proficiencyLevel, 10)
        })
        .select(`
          id,
          proficiency_level,
          skills (
            id,
            name,
            category
          )
        `)
        .single();
        
      if (error) throw error;
      
      // Update local state
      setSkills(prev => [...prev, data]);
      
      // Reset form
      setSelectedSkill('');
      setProficiencyLevel('3');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to add skill. Please try again.');
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      // Remove skill from database
      const { error } = await supabase
        .from('profile_skills')
        .delete()
        .eq('id', skillId);
        
      if (error) throw error;
      
      // Update local state
      setSkills(prev => prev.filter(skill => skill.id !== skillId));
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to remove skill. Please try again.');
    }
  };

  const handleToggleAvailability = (day: string, timeOfDay: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeOfDay]: !prev[day][timeOfDay]
      }
    }));
  };

  const handleSaveAvailability = async () => {
    try {
      // Clear existing availability
      await supabase
        .from('availability')
        .delete()
        .eq('profile_id', profile.id);
      
      // Convert UI availability to database format
      const availabilityRecords = [];
      
      for (const [day, times] of Object.entries(availability)) {
        for (const [timeOfDay, isAvailable] of Object.entries(times)) {
          if (isAvailable) {
            const dayNumber = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
            let startTime, endTime;
            
            switch (timeOfDay) {
              case 'Morning':
                startTime = '08:00:00';
                endTime = '12:00:00';
                break;
              case 'Afternoon':
                startTime = '13:00:00';
                endTime = '17:00:00';
                break;
              case 'Evening':
                startTime = '18:00:00';
                endTime = '22:00:00';
                break;
            }
            
            availabilityRecords.push({
              profile_id: profile.id,
              day_of_week: dayNumber,
              start_time: startTime,
              end_time: endTime,
              recurring: true
            });
          }
        }
      }
      
      if (availabilityRecords.length > 0) {
        // Add new availability
        const { error } = await supabase
          .from('availability')
          .insert(availabilityRecords);
          
        if (error) throw error;
      }
      
      alert('Availability saved successfully!');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save availability. Please try again.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Upload file to Supabase Storage
      const filePath = `profile-images/${profile.id}/${Math.random().toString(36).substring(2)}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const publicUrl = data.publicUrl;
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_image_url: publicUrl
        })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        profile_image_url: publicUrl
      }));
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to upload image. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Loading profile...</p>
        </div>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Profile not found. Please log in to view your profile.</p>
        </div>
      </Container>
    );
  }

  return (
    <ProfileContainer>
      <Flex justify="space-between" align="center" style={{ marginBottom: theme.spacing.lg }}>
        <Title>
          Profile
          <UserTypeTag variant="primary">{profile.type}</UserTypeTag>
        </Title>
        
        {activeTab === 'basic' && (
          editMode ? (
            <Flex gap={theme.spacing.md}>
              <SecondaryButton onClick={() => setEditMode(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleSubmit}>
                Save Changes
              </PrimaryButton>
            </Flex>
          ) : (
            <PrimaryButton onClick={() => setEditMode(true)}>
              Edit Profile
            </PrimaryButton>
          )
        )}
        
        {activeTab === 'availability' && profile.type === 'volunteer' && (
          <PrimaryButton onClick={handleSaveAvailability}>
            Save Availability
          </PrimaryButton>
        )}
      </Flex>
      
      {errorMessage && (
        <ErrorMessage style={{ marginBottom: theme.spacing.md }}>
          {errorMessage}
        </ErrorMessage>
      )}
      
      <ProfileHeader>
        <AvatarContainer>
          <Avatar imageUrl={profile.profile_image_url}>
            {!profile.profile_image_url && <FaUser />}
          </Avatar>
          <AvatarUploadButton>
            <FaCamera />
            <FileInput 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </AvatarUploadButton>
        </AvatarContainer>
        
        <ProfileInfo>
          <Card style={{ height: '100%' }}>
            <h2 style={{ fontSize: theme.fontSizes.xl, marginBottom: theme.spacing.md }}>
              {profile.display_name || 'User'}
            </h2>
            
            <Grid columns={2} gap={theme.spacing.md}>
              <div>
                <Label>Email</Label>
                <p>{profile.email || 'No email provided'}</p>
              </div>
              
              <div>
                <Label>Member Since</Label>
                <p>{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </Grid>
          </Card>
        </ProfileInfo>
      </ProfileHeader>
      
      <ProfileTabs>
        <TabsContainer>
          <Tab 
            active={activeTab === 'basic'}
            onClick={() => setActiveTab('basic')}
          >
            Basic Information
          </Tab>
          
          {isVolunteer && (
            <>
              <Tab 
                active={activeTab === 'skills'}
                onClick={() => setActiveTab('skills')}
              >
                Skills
              </Tab>
              
              <Tab 
                active={activeTab === 'availability'}
                onClick={() => setActiveTab('availability')}
              >
                Availability
              </Tab>
            </>
          )}
        </TabsContainer>
        
        {activeTab === 'basic' && (
          <Card>
            {editMode ? (
              <Grid columns={1} gap={theme.spacing.md}>
                <FormGroup>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    value={formState.display_name}
                    onChange={handleInputChange}
                    placeholder="Your name or organization name"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="bio">Bio</Label>
                  <TextArea
                    id="bio"
                    name="bio"
                    value={formState.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself or your organization"
                    rows={5}
                  />
                </FormGroup>
                
                <Grid columns={2} gap={theme.spacing.md}>
                  <FormGroup>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formState.location}
                      onChange={handleInputChange}
                      placeholder="City, State, Country"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </FormGroup>
                </Grid>
                
                <FormGroup>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formState.website}
                    onChange={handleInputChange}
                    placeholder="Your personal website or organization website"
                  />
                </FormGroup>
              </Grid>
            ) : (
              <Grid columns={1} gap={theme.spacing.md}>
                <div>
                  <Label>Bio</Label>
                  <p>{profile.bio || 'No bio provided'}</p>
                </div>
                
                <Grid columns={3} gap={theme.spacing.md}>
                  <div>
                    <Label>
                      <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                      Location
                    </Label>
                    <p>{profile.location || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <Label>
                      <FaPhone style={{ marginRight: '8px' }} />
                      Phone Number
                    </Label>
                    <p>{profile.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <Label>
                      <FaGlobe style={{ marginRight: '8px' }} />
                      Website
                    </Label>
                    <p>{profile.website || 'Not provided'}</p>
                  </div>
                </Grid>
              </Grid>
            )}
          </Card>
        )}
        
        {activeTab === 'skills' && profile.type === 'volunteer' && (
          <Card>
            <h3 style={{ fontSize: theme.fontSizes.lg, marginBottom: theme.spacing.md }}>
              Your Skills
            </h3>
            
            <SkillsContainer>
              {skills.length > 0 ? (
                skills.map(skill => (
                  <SkillItem key={skill.id}>
                    <SkillInfo>
                      <SkillName>{skill.skills.name}</SkillName>
                      <SkillCategory>
                        {skill.skills.category || 'General'} • Proficiency Level: {skill.proficiency_level}/5
                      </SkillCategory>
                    </SkillInfo>
                    <DeleteButton onClick={() => handleRemoveSkill(skill.id)}>
                      <FaTrash />
                    </DeleteButton>
                  </SkillItem>
                ))
              ) : (
                <p>You haven't added any skills yet. Add skills to improve your match recommendations.</p>
              )}
              
              <AddSkillRow>
                <FormGroup style={{ flex: 2 }}>
                  <Label htmlFor="skill">Add Skill</Label>
                  <Select
                    id="skill"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                  >
                    <option value="">Select a skill</option>
                    {allSkills.map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} {skill.category ? `(${skill.category})` : ''}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="proficiency">Proficiency</Label>
                  <Select
                    id="proficiency"
                    value={proficiencyLevel}
                    onChange={(e) => setProficiencyLevel(e.target.value)}
                  >
                    <option value="1">1 - Beginner</option>
                    <option value="2">2 - Basic</option>
                    <option value="3">3 - Intermediate</option>
                    <option value="4">4 - Advanced</option>
                    <option value="5">5 - Expert</option>
                  </Select>
                </FormGroup>
                
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <PrimaryButton 
                    onClick={handleAddSkill}
                    disabled={!selectedSkill}
                    style={{ height: '41px' }}
                  >
                    <FaPlus style={{ marginRight: theme.spacing.xs }} />
                    Add
                  </PrimaryButton>
                </div>
              </AddSkillRow>
            </SkillsContainer>
          </Card>
        )}
        
        {activeTab === 'availability' && profile.type === 'volunteer' && (
          <Card>
            <h3 style={{ fontSize: theme.fontSizes.lg, marginBottom: theme.spacing.md }}>
              Your Availability
            </h3>
            
            <p style={{ marginBottom: theme.spacing.md }}>
              Select the times when you're generally available to volunteer. This helps organizations find volunteers for their events.
            </p>
            
            <AvailabilityContainer>
              {Object.entries(availability).map(([day, times]) => (
                <DayRow key={day}>
                  <DayLabel>{day}</DayLabel>
                  <TimeSlots>
                    {Object.entries(times).map(([timeOfDay, isSelected]) => (
                      <TimeSlot
                        key={`${day}-${timeOfDay}`}
                        selected={isSelected}
                        onClick={() => handleToggleAvailability(day, timeOfDay)}
                      >
                        {timeOfDay}
                      </TimeSlot>
                    ))}
                  </TimeSlots>
                </DayRow>
              ))}
            </AvailabilityContainer>
          </Card>
        )}
      </ProfileTabs>
    </ProfileContainer>
  );
}
