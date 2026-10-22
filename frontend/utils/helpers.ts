// reusable helper functions for frontend

import { useWindowDimensions } from "react-native"

// reusable function to get numColumns for FlatList based on window width
export function FlatListColumns() {
    const windowWidth = useWindowDimensions().width
      
    // change flatlist numcolumns based on window width (cards are 300 width)
    const numberOfColumns = (
        (windowWidth <= 900) ? 2 :
        (windowWidth <= 1200) ? 3 : 
        (windowWidth <= 1500) ? 4 : 
        (windowWidth <= 1800) ? 5 : 
        6
    )

    return numberOfColumns
}

// reusable function for formatting the date from iso to localdatestring
export function formatDate(oldDate: string) {
    let newDate = new Date(oldDate)
    return newDate.toLocaleDateString()
}

// function for formatting start/end date strings
export function formatFilterDate(filterDate: string) {
    // split up by -
    const dateParts = filterDate.split('-')
    // put split up parts in array
    const [year, month, day] = dateParts
    // format as month/day/year
    const formattedDate = `${month}/${day}/${year}`
    return formattedDate
}