// Search screen

import { Text, View, StyleSheet } from 'react-native';

export default function SearchScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        color: '#000',
        fontSize: 24,
        fontWeight: 'bold'
    }
})