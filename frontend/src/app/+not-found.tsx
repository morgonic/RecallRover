import {View, StyleSheet} from 'react-native';
import {Link, Stack} from 'expo-router';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Whoops! This page does not exist.' }} />
            <View style={styles.container}>
                <Link href="/" style={styles.button}>
                    Go back to Recall Feed
                </Link>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        fontSize: 18,
        textDecorationLine: 'underline',
        color: '#000'
    }
})