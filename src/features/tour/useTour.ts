import { useContext } from 'react'
import { TourContext } from './TourProvider'

export function useTour() {
    return useContext(TourContext)
}
