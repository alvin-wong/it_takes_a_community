"use client";

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Container,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import classes from './HeaderSimple.module.css';

const links = [
  { link: '/about', label: 'Education' },
  { link: '/pricing', label: 'Healthcare' },
  { link: '/learn', label: 'Learn' },
  { link: '/community', label: 'Community' },
];

function ThemeToggle({ toggleTheme }) {
  const theme = useTheme();

  return (
    <IconButton onClick={toggleTheme} color="inherit" aria-label="Toggle color scheme">
      {theme.palette.mode === 'light' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}

export function HeaderSimple() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [active, setActive] = useState(links[0].link);
  const [themeMode, setThemeMode] = useState('light');
  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const items = links.map((link) => (
    <Button
      key={link.label}
      href={link.link}
      color="inherit"
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </Button>
  ));

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Container maxWidth="md">
          <Toolbar disableGutters className={classes.inner}>
            <img src="/itac-logo.svg" alt="HackGT Logo" className={classes.logo} />
            {isMobile ? (
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenuOpen}
                  sx={{ ml: 'auto' }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  keepMounted
                  sx={{ display: { xs: 'block', md: 'none' } }}
                >
                  {links.map((link) => (
                    <MenuItem
                      key={link.label}
                      onClick={() => {
                        setActive(link.link);
                        handleMenuClose();
                      }}
                    >
                      {link.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {items}
              </Box>
            )}
            <ThemeToggle toggleTheme={toggleTheme} />
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}
