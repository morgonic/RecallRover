// Log In screen

import { Text, View, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { deleteGuest, setGuest, setToken } from '@/app/storage';
import validator from 'validator';
import { styles } from './styles';

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;


export default function LoginScreen() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [securePass, setSecurePass] = useState(true)
    const canLogIn = (email.trim() != '' && password != '')
    const [invalidEmail, setInvalidEmail] = useState(false)
    const [loginError, setLoginError] = useState('')


    {/*function called when log in button pressed*/}
    async function onLogin() {
        if (!validator.isEmail(email)) {
            setInvalidEmail(true)
        }
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
            // get json from response
            const json = await response.json()
            // error if bad response
            if (!response.ok) {
                if (json.detail == "LOGIN_BAD_CREDENTIALS") {
                    setLoginError("Invalid email or password. Please try again.");
                }
                else {
                    setLoginError('')
                }
                throw new Error(`HTTP ${response.status}`)
            }
            // get access token from json response and store it
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
                    onChangeText={setEmail}
                    value={email}
                    placeholder='Email address'
                    placeholderTextColor={'grey'}
                />
                {invalidEmail ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        Please enter a valid email address.
                    </Text>
                ) : (
                    <View style={{height: 14}}/>
                )}
                <View style={{flexDirection: 'row'}}>
                    <TextInput 
                    style={styles.textinput}
                    onChangeText={setPassword}
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
                {(loginError != '') ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {loginError}
                    </Text>
                ) : (
                    <View style={{height: 14}}/>
                )}
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
                            {backgroundColor: !canLogIn ? '#bfc0c0' : pressed ? '#25426e' : '#4175c4'}]
                        }
                        disabled={!canLogIn}
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