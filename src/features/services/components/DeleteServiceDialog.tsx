'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface DeleteServiceDialogProps {
    open: boolean
    serviceName: string
    onCancel: () => void
    onConfirm: () => void
}

export function DeleteServiceDialog({
    open,
    serviceName,
    onCancel,
    onConfirm,
}: DeleteServiceDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete &ldquo;{serviceName}&rdquo;?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Clients will no longer be able to book this service once it&apos;s deleted.
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={onConfirm}>Yes, Delete</Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
