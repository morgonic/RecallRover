// reusable component to render sections in RecallDetailsModal

import { Text } from 'react-native'
import { styles } from "@/app/styles"


interface RecallDetailsSectionProps {
    heading: string
    details: (string | null)[] | null | undefined
}

export function RecallDetailsSection(props: RecallDetailsSectionProps) {
    if (!props.details || props.details.length == 0) {
        return null
    }
    return (
            <>
                <Text style={styles.detailsHeader}>
                    {props.heading}:
                </Text>
                {props.details.map((detail, index) => (
                    <Text
                        key={index}
                        style={styles.detailsText}
                    >
                        {detail}
                    </Text>
                ))}
            </>
    )
}