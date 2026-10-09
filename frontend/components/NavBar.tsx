import { deleteToken } from "@/app/storage";
import { styles } from "@/app/styles";
import { Link, router } from "expo-router";
import { Pressable, View, Text } from "react-native";

interface NavBarProps {
    loggedIn: boolean
    onGuestWatchList: () => void
}


export function NavBar(props: NavBarProps) {

    async function onLogOut() {
        await deleteToken();
        router.replace('/login');
    }
    
    return (
        <View style={styles.navigationBar}>
            <Link href="/search" style={styles.navButton}>
                Search
            </Link>
            <Text style={styles.navButtonDivider}> | </Text>
            <Link href="/" style={styles.navButton}>
                Recall Feed
            </Link>
            <Text style={styles.navButtonDivider}> | </Text>
            {props.loggedIn ? (
                <Link href="/watch-list" style={styles.navButton}>
                    Watch List
                </Link>
            ) : (
                <Pressable
                    onPress={props.onGuestWatchList}
                >
                    <Text style={styles.navButton}>
                        Watch List
                    </Text>
                </Pressable>
            )}
            <Text style={styles.navButtonDivider}> | </Text>
            {props.loggedIn ? (
                <Pressable
                    onPress={onLogOut}
                >
                    <Text style={styles.navButton}>
                        Log Out
                    </Text>
                </Pressable>
            ) : (
                <Link href="/login" style={styles.navButton}>
                    Log In
                </Link>
            )}
        </View>
    )
}