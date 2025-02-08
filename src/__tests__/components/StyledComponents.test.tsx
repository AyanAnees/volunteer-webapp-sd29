import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { 
  Container, 
  Card, 
  Button,
  PrimaryButton,
  SecondaryButton, 
  Flex, 
  Grid,
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  RadioGroup,
  RadioLabel,
  ErrorMessage,
  Badge
} from '../../components/ui/StyledComponents.tsx';

// Create a wrapper with BrowserRouter for Link components
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('StyledComponents', () => {
  // Layout Components
  it('renders Container component', () => {
    render(<Container data-testid="container">Container Content</Container>);
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByText('Container Content')).toBeInTheDocument();
  });

  it('renders Card component', () => {
    render(
      <Card data-testid="card">
        <p>Card Content</p>
      </Card>
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders Flex component with different properties', () => {
    render(
      <Flex 
        data-testid="flex" 
        $direction="row" 
        $justify="flex-start" 
        $align="stretch" 
        $gap="0"
      >
        <div>Flex Item 1</div>
        <div>Flex Item 2</div>
      </Flex>
    );
    
    const flexElement = screen.getByTestId('flex');
    expect(flexElement).toBeInTheDocument();
    expect(flexElement).toHaveStyle('display: flex');
    expect(flexElement).toHaveStyle('flex-direction: row');
    expect(flexElement).toHaveStyle('justify-content: flex-start');
    expect(flexElement).toHaveStyle('align-items: stretch');
    expect(flexElement).toHaveStyle('gap: 0');
  });

  it('renders Grid component with custom columns and gap', () => {
    render(
      <Grid 
        data-testid="grid" 
        $columns={1} 
        $gap="1rem"
      >
        <div>Grid Item 1</div>
        <div>Grid Item 2</div>
      </Grid>
    );
    
    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toBeInTheDocument();
    expect(gridElement).toHaveStyle('display: grid');
    expect(gridElement).toHaveStyle('gap: 1rem');
  });

  // Button Components
  it('renders Button component', () => {
    render(<Button data-testid="button">Click Me</Button>);
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('renders PrimaryButton component', () => {
    render(<PrimaryButton data-testid="primary-button">Primary</PrimaryButton>);
    const button = screen.getByTestId('primary-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Primary');
  });

  it('renders SecondaryButton component', () => {
    render(<SecondaryButton data-testid="secondary-button">Secondary</SecondaryButton>);
    const button = screen.getByTestId('secondary-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Secondary');
  });

  it('renders disabled Button component', () => {
    render(
      <Button 
        data-testid="disabled-button" 
        disabled
      >
        Disabled
      </Button>
    );
    
    const button = screen.getByTestId('disabled-button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  // Form Components
  it('renders form components', () => {
    render(
      <div>
        <FormGroup data-testid="form-group">
          <Label data-testid="label" htmlFor="test-input">
            Test Label
          </Label>
          <Input 
            data-testid="input" 
            id="test-input" 
            placeholder="Enter value" 
          />
          <ErrorMessage data-testid="error">
            This is an error
          </ErrorMessage>
        </FormGroup>
      </div>
    );
    
    expect(screen.getByTestId('form-group')).toBeInTheDocument();
    expect(screen.getByTestId('label')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('renders select and textarea components', () => {
    render(
      <div>
        <Select data-testid="select">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
        
        <TextArea 
          data-testid="textarea" 
          placeholder="Enter text" 
        />
      </div>
    );
    
    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders radio group components', () => {
    render(
      <RadioGroup data-testid="radio-group">
        <RadioLabel data-testid="radio-label">
          <input type="radio" name="test" value="option1" />
          Option 1
        </RadioLabel>
      </RadioGroup>
    );
    
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    expect(screen.getByTestId('radio-label')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  // Badge Component
  it('renders Badge component', () => {
    render(
      <Badge data-testid="badge">
        New
      </Badge>
    );
    
    expect(screen.getByTestId('badge')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
