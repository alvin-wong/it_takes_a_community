"use client";

import { useState } from 'react';
import Link from 'next/link'; // Import Link from next.js
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Stack
} from '@mui/material';
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
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href='/' edge='start'>
            <img src="/itac-logo.svg" alt="HackGT Logo" className="logo" />
          </Link>
          <Stack direction='row' spacing={2} sx={{ marginLeft: 'auto' }}>
            {items}
          </Stack>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}