import React, { useState } from 'react'
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { Text } from '@components/editor/Text';
import { Menu } from 'lucide-react';
import Drawer from '@mui/joy/Drawer';
import Box from '@mui/joy/Box';

export default function Navbar() {
    const navLinks = ["About", "Policies", "Services", "Contact"]
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
        <div>
            <nav className=' p-8  flex md:justify-center justify-start'>
                <div className='hidden md:flex w-[1280px] justify-between'>
                    <div>LOGO</div>
                    <div className='flex gap-24 items-center'>
                        {
                            navLinks.map((element: string, index: number) => {
                                return (
                                    <div key={index}>
                                        <Text text={element} fontSize={12} fontColor='#111827' />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className='md:hidden flex justify-start'>
                    <Button variant='plain' color='neutral' onClick={toggleDrawer(true)}>
                        <Menu />
                    </Button>
                    <Drawer open={open} onClose={toggleDrawer(false)}>
                        <Box
                            role="presentation"
                            onClick={toggleDrawer(false)}
                            onKeyDown={toggleDrawer(false)}
                        >

                        </Box>
                    </Drawer>
                </div>
            </nav>
        </div>
    )
}
