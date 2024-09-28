"use client";

import { useState } from 'react';
import Link from 'next/link'; // Import Link from next.js
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Container,
  Box,
  Menu,
  MenuItem,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Define the links for the navigation menu
const links = [
  { link: '/about', label: 'Education' },
  { link: '/pricing', label: 'Healthcare' },
  { link: '/learn', label: 'Learn' },
  { link: '/community', label: 'Community' },
];

export function HeaderSimple() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [active, setActive] = useState(links[0].link);

  const theme = createTheme({
    palette: {
      mode: 'light', // Force light mode
    },
  });

  const isMobile = useMediaQuery(theme.breakpoints.down('xs')); // Check if the screen is mobile

  // Open the mobile menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the mobile menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Generate the navigation items
  const items = links.map((link) => (
    <Button
      key={link.label}
      href={link.link}
      color="inherit"
      className="link"
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
      <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters className="inner">
            {/* Ensure logo is positioned at far left */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Link href="/">
                <img src="/itac-logo.svg" alt="HackGT Logo" className="logo" />
              </Link>
            </Box>

            {/* Right-aligned navigation links */}
            <nav className="nav" style={{ flexGrow: 1 }}>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-evenly', width: '100%' }}>
                {items}
              </Box>

              {/* Mobile menu */}
              {isMobile && (
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
              )}
            </nav>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}
