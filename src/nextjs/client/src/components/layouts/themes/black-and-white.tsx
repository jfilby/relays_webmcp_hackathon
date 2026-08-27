import { createTheme } from '@mui/material';

export const blackAndWhiteTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111111', // Near-black, matching the landing page accent
      contrastText: '#FFFFFF', // White text
    },
    secondary: {
      main: '#555555', // Neutral gray as an accent
    },
    background: {
      default: '#FAFAFA', // Light gray background so white cards stand out
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5A5A5A',
    },
    divider: '#E4E4E4',
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        a: {
          color: '#111111', // Near-black links
          textDecoration: 'none',
          '&:visited': {
            color: '#111111', // Keep on visited
          },
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
          },
        },
        outlined: {
          borderColor: '#D9D9D9',
          '&:hover': {
            borderColor: '#111111',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E4E4E4',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', // Subtle shadow
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
  },
});
