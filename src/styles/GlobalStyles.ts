import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${theme.colors.background};
    color: ${theme.colors.gray[800]};
    line-height: 1.5;
  }
  
  #root {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  
  a {
    text-decoration: none;
    color: ${theme.colors.primary};
  }
  
  button {
    cursor: pointer;
  }
  
  input, button, textarea, select {
    font-family: inherit;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.25;
  }
  
  img {
    max-width: 100%;
  }
  
  /* Responsive adjustments */
  @media (max-width: ${theme.breakpoints.md}) {
    .container {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
`;
