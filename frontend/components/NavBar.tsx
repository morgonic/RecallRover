import { deleteToken } from "@/app/storage";
import { styles } from "@/app/styles";
import { Link, router } from "expo-router";
import { Pressable, View, Text } from "react-native";

interface NavBarProps {
    loggedIn: boolean
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
            <Link href="/" style={styles.navButton}>
                Recall Feed
            </Link>
            <Link href="/watch-list" style={styles.navButton}>
                Watch List
            </Link>
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