// Watch List screen

import { Text, View, StyleSheet } from 'react-native';
import { styles } from './styles';
import { Link } from 'expo-router';

export default function WatchListScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.navigationBar}>
                <Link href="/search" style={styles.navButton}>
                    Search
                </Link>
                <Link href="/" style={styles.navButton}>
                    Recall Feed
                </Link>
                <Link href="/watch-list" style={styles.navButton}>
                    Watch List
                </Link>
                <Link href="/login" style={styles.navButton}>
                    Log In
                </Link>
            </View>
            <Text style={styles.title}>Watch List</Text>
            <View style={{height: 14}}/>
            <View style={{height: 2, width: '80%', backgroundColor: 'black', marginVertical: 14}}/>

        </View>
    )
}