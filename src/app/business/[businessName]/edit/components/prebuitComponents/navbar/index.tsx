'use client'


import { registerOverlayPortal, SlotComponent } from "@puckeditor/core";
import { MenuIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ButtonTypeMap, Checkbox as MUICheckbox, CircularProgress, DialogActions, DialogContent, Divider, Drawer, ExtendButton, IconButton, Input as MUIInput, Modal, ModalClose, ModalDialog, Button as MUIButton, ToggleButtonGroup, TypographySystem } from "@mui/joy";
import { ButtonLinkDefaultProps, navbarFields } from "./fields";
import { navbarProps } from "../../defaultStyles";




export const NavbarComponent: any = {
    fields: navbarFields,
    defaultProps: navbarProps,
    render: ({ content: Navbar, logo: Logo, menu, puck }: any) => {
        const [open, setOpen] = useState<boolean>(false)
        const ref = useRef<HTMLDivElement>(null);
        const rootRef = useRef<HTMLDivElement>(null);
        const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

        useEffect(() => {
            registerOverlayPortal(ref.current)
            // Find the iframe created by Puck
            const iframe = document.querySelector('iframe[data-rfd-iframe="true"]');
            if (iframe && iframe instanceof HTMLIFrameElement) {
                // Wait until iframe content is loaded
                iframe.addEventListener('load', () => {
                    setIframeBody(iframe.contentDocument?.body ?? null);
                });

                // In case it's already loaded
                if (iframe.contentDocument?.readyState === 'complete') {
                    setIframeBody(iframe.contentDocument.body);
                }
            }

        }, [ref.current]);
        return (
            <div>
                <nav className="w-full flex justify-between items-center px-8 py-5">
                    <div> <Logo /></div>
                    <div className={`text-center hidden lg:flex lg:gap-10 items-center`}>
                        {
                            menu.map(({ item: Item }: { item: SlotComponent }, index: number) => {
                                return <div key={index} className=" align-middle">
                                    <Item className="max-w-max" />
                                </div>
                            })
                        }
                    </div>
                    <div ref={ref} className="lg:hidden block" onClick={() => {
                        setOpen(true)
                    }}>
                        <MenuIcon />
                    </div>
                    {open ? <Drawer anchor="top" container={iframeBody}
                        open={open} onClose={() => {
                            setOpen(false)
                        }}>
                        <div draggable={false}
                            className="flex items-center gap-5 py-10 flex-col justify-center">
                            {
                                menu.map(({ item: Item }: { item: SlotComponent }, index: number) => {
                                    console.log(Logo, Item)
                                    return <div key={index}>
                                        <Item className="max-w-max" />
                                    </div>
                                })
                            }

                        </div>
                    </Drawer> : <></>}
                </nav>
            </div>
        )
    }
}
