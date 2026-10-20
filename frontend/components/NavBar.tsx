import { deleteToken } from "@/app/storage";
import { styles } from "@/app/styles";
import { Link, router, usePathname } from "expo-router";
import { Pressable, View, Text } from "react-native";

interface NavBarProps {
    loggedIn: boolean
    onGuestWatchList: () => void
}


export function NavBar(props: NavBarProps) {

    // currently selected path
    const currentPath = usePathname()

    async function onLogOut() {
        await deleteToken();
        router.replace('/login');
    }
    
    return (
        <View style={styles.navigationBar}>
            <Link href="/search" style={[styles.navButton, (currentPath == '/search' && styles.activeNavButton)]}>
                Search
            </Link>
            <Text style={styles.navButtonDivider}> | </Text>
            <Link href="/" style={[styles.navButton, (currentPath == '/' && styles.activeNavButton)]}>
                Recall Feed
            </Link>
            <Text style={styles.navButtonDivider}> | </Text>
            {props.loggedIn ? (
                <Link href="/watch-list" style={[styles.navButton, (currentPath == '/watch-list' && styles.activeNavButton)]}>
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