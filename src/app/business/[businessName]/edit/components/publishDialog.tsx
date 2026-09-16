'use client'

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PublishDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlName: string
    publishing: boolean
    onConfirm: () => void
}

function displayHost(): string {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beta.afroallure.co'
    return base.replace(/^https?:\/\//, '')
}

export function PublishDialog({ open, onOpenChange, urlName, publishing, onConfirm }: PublishDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Publish your page?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your page will go live at {displayHost()}/{urlName}. Visitors will see these changes immediately.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={publishing}
                        onClick={onConfirm}
                        style={{ backgroundColor: '#FC6161' }}
                    >
                        Publish now
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
