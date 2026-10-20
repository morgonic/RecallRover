// reusable function to get numColumns for FlatList based on window width

import { useWindowDimensions } from "react-native"


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