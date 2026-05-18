'use client'


import { registerOverlayPortal, SlotComponent } from "@puckeditor/core";
import { MenuIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ButtonLinkDefaultProps, navbarFields } from "./fields";
import { navbarProps } from "../../defaultStyles";




export const NavbarComponent: any = {
    fields: navbarFields,
    defaultProps: navbarProps,
    render: ({ logo: Logo, menu, puck }: any) => {
        const [open, setOpen] = useState<boolean>(false)
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            registerOverlayPortal(ref.current)
        }, [ref.current]);

        return (
            <div>
                <nav className="w-full flex justify-between items-center px-8 py-5">
                    <div><Logo /></div>
                    <div className={`text-center hidden lg:flex lg:gap-10 items-center`}>
                        {menu.map(({ item: Item }: { item: SlotComponent }, index: number) => {
                            return <div key={index} className="align-middle">
                                <Item className="max-w-max" />
                            </div>
                        })}
                    </div>
                    <div ref={ref} className="lg:hidden block cursor-pointer" onClick={() => setOpen(true)}>
                        <MenuIcon />
                    </div>
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetContent side="top">
                            <div draggable={false} className="flex items-center gap-5 py-10 flex-col justify-center">
                                {menu.map(({ item: Item }: { item: SlotComponent }, index: number) => {
                                    return <div key={index}><Item className="max-w-max" /></div>
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>
                </nav>
            </div>
        )
    }
}
