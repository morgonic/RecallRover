// Log In screen

import { Text, View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { deleteGuest, setGuest, setToken } from '@/app/storage';

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;


export default function LoginScreen() {
    const [email, onChangeEmail] = useState("")
    const [password, onChangePassword] = useState("")
    const [securePass, setSecurePass] = useState(true)


    {/*function called when log in button pressed*/}
    async function onLogin() {
        try {
            // attach username (email) and password to urlsearchparams for fastapi users /login
            const body = new URLSearchParams()
            body.append('username', email.trim())
            body.append('password', password)

            // send request to /login route
            const response = await fetch(`${API_URL}/auth/jwt/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: body.toString()
            })
            // error if bad response
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }
            // get access token from json response and store it
            const json = await response.json()
            await setToken(json.access_token)
            // clear guest flag, not a guest anymore
            await deleteGuest();
            // redirect to recall feed (index) after login
            router.replace('/')
        }
        catch (e: any) {
            console.log(`Error ${e.name}: ${e.message}`)
        }
    }

    {/*function called when create account button pressed*/}
    async function onCreateAccount() {
        router.replace('/create-account')
    }

    {/*function called when continue as guest button pressed*/}
    async function onContinueGuest() {
        await setGuest();
        router.replace('/')
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>RecallRover</Text>
                <View style={{alignItems: 'flex-start', marginLeft: 30}}>
                <TextInput 
                    style={styles.textinput}
                    onChangeText={onChangeEmail}
                    value={email}
                    placeholder='Email address'
                    placeholderTextColor={'grey'}
                />
                <View style={{flexDirection: 'row'}}>
                    <TextInput 
                    style={styles.textinput}
                    onChangeText={onChangePassword}
                    value={password}
                    placeholder='Password'
                    placeholderTextColor={'grey'}
                    secureTextEntry={securePass}
                    />
                    <Pressable 
                        onPress={() => setSecurePass(!securePass)}
                        style={{alignSelf: 'center'}}
                    >
                        {/*change eye icon based on password visibility*/}
                        {securePass ? (
                            <Ionicons name="eye-off" size={30}/>
                        ) : (
                            <Ionicons name="eye" size={30}/>
                        )}

                    </Pressable> 
                </View>
                <View style={{flexDirection: 'row'}}>
                    <Pressable
                        onPress={onCreateAccount}
                        style={({pressed}) =>
                            [styles.button,
                            {backgroundColor: pressed ? '#25426e' : '#4175c4'}]
                        }
                    >
                        <Text style={styles.buttonText}>
                            Create Account
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={onLogin}
                        style={({pressed}) =>
                            [styles.button,
                            {backgroundColor: pressed ? '#25426e' : '#4175c4'}]
                        }
                    >
                        <Text style={styles.buttonText}>
                            Log In
                        </Text>
                    </Pressable>
                    
                </View>
                <View style={{alignSelf: 'flex-end', marginRight: 40}}>
                    <Pressable
                        onPress={() => {}}
                    >
                        <Text style={styles.forgotPass}>
                            Forgot Password?
                        </Text>
                    </Pressable>
                </View>
                
            </View>
            <View>
                <Pressable
                    onPress={onContinueGuest}
                >
                    <Text style={styles.buttonGuest}>
                        Continue as Guest
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        color: '#000',
        fontSize: 24,
        fontWeight: 'bold',
        margin: 20,
    },
    textinput: {
        height: 40,
        width: 300,
        margin: 10,
        borderWidth: 1,
        padding: 10,
    },
    button: {
        backgroundColor: "#4175c4",
        flex: 1,
        justifyContent: 'center',
        height: 40,
        width: 140,
        borderRadius: 10,
        margin: 10,
        padding: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    buttonGuest: {
        fontSize: 20,
        textDecorationLine: 'underline',
        fontWeight: '600',
        marginTop: 60
    },
    forgotPass: {
        fontSize: 16,
        textDecorationLine: 'underline',
        fontWeight: '500'
    }
})