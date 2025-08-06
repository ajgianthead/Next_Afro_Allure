'use client'

import { Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton } from '@mui/joy';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const LandingPageNavDrawer = () => {
    const [open, setOpen] = useState(false);

    const toggleDrawer =
        (inOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
            if (
                event.type === 'keydown' &&
                ((event as React.KeyboardEvent).key === 'Tab' ||
                    (event as React.KeyboardEvent).key === 'Shift')
            ) {
                return;
            }

            setOpen(inOpen);
        };
    return (
        <div className='sticky top-0 z-50'>
            <nav className="w-full py-2 z-50 flex justify-center bg-white ">
                <div className="w-[1280px] px-5 flex justify-start">
                    <IconButton onClick={toggleDrawer(true)}>
                        <Menu />
                    </IconButton>
                    <Drawer anchor='top' size='sm' open={open} onClose={toggleDrawer(false)}>
                        <div
                            className='flex flex-col items-center mt-10 text-center'
                            role="presentation"
                            onClick={toggleDrawer(false)}
                            onKeyDown={toggleDrawer(false)}
                        >

                            <List>
                                <ListItem>
                                    <ListItemButton disabled className='flex justify-center'>Marketplace</ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton component='a' href='#features' className='flex justify-center'>Features</ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton component='a' href='#about' className='flex justify-center'>About</ListItemButton>
                                </ListItem>

                            </List>
                            <Divider sx={{
                                marginX: 10
                            }} />
                            <List>
                                <ListItem>
                                    <ListItemButton color='primary' href='/register' component='a' className='flex justify-center'>Register your Business</ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton component='a' href='/login' className='flex justify-center'>Login</ListItemButton>
                                </ListItem>

                            </List>
                        </div>
                    </Drawer>

                </div>
            </nav>
        </div>
    );
}

export default LandingPageNavDrawer;
