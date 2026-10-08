// Create Account screen

import { Text, View, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { deleteGuest, setGuest, setToken } from './storage';
import validator from 'validator';
import { styles } from './styles';

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateAccountScreen() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [securePass, setSecurePass] = useState(true)
    const [secureConfirmPass, setSecureConfirmPass] = useState(true)
    const [invalidEmail, setInvalidEmail] = useState(false)
    const [emailInUse, setEmailInUse] = useState(false)
    const [emailUsedError, setEmailUsedError] = useState('')
    const [passwordsMatch, setPasswordsMatch] = useState(true)
    const [passMatchError, setPassMatchError] = useState('')
    const [emptyPassword, setEmptyPassword] = useState(false)
    const [emptyPassError, setEmptyPassError] = useState('')
    const [emptyConfirmPass, setEmptyConfirmPass] = useState(false)
    const [emptyConfirmPassError, setEmptyConfirmPassError] = useState('')
    const [loginError, setLoginError] = useState('')
    const [registerError, setRegisterError] = useState('')

    {/*function called when log in button pressed*/}
    async function onLogin() {
        router.replace('/login')
    }

    {/*function called when create account button pressed*/}
    async function onCreateAccount() {
        // reset useStates
        setInvalidEmail(false)
        setEmailInUse(false)
        setPasswordsMatch(true)
        setEmailUsedError('')
        setPassMatchError('')
        setEmptyPassError('')
        setEmptyConfirmPassError('')
        setLoginError('')
        setRegisterError('')
        // initialize error bool as false
        let hasError = false
        // if passwords don't match, update error states
        if (password != confirmPassword) {
            setPasswordsMatch(false)
            hasError = true
            setPassMatchError('Passwords do not match.')
        }
        // if invalid email, update error states
        if (!validator.isEmail(email)) {
            setInvalidEmail(true)
            hasError = true
        }
        // if password is not empty, update state
        if (password != '') {
            setEmptyPassword(false)
        }
        // otherwise password is empty, set error states
        else {
            setEmptyPassword(true)
            hasError = true
            setEmptyPassError('Please enter a password.')
        }
        // if the confirm password textinput is not empty, update state
        if (confirmPassword != '') {
            setEmptyConfirmPass(false)
        }
        // otherwise confirm password is empty, set error states
        else {
            setEmptyConfirmPass(true)
            hasError = true
            setEmptyConfirmPassError('Please confirm your password.')
        }
        // if there are any errors, do not attempt to register
        if (hasError) {
            return
        }
        
        // try registering with email/password entered
        try {
            // send request to /register route
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: email.trim(), password: password})
            })
            // get json from response
            const json = await response.json()
            // set bad response details to proper states
            if (!response.ok) {
                if (json.detail == "REGISTER_USER_ALREADY_EXISTS") {
                    setEmailInUse(true)
                    setEmailUsedError("Email is already registered. Please log in.");
                }
                else {
                    setEmailInUse(false)
                    setEmailUsedError('')
                }
                return
            }
        }
        catch (e: any) {
            console.log(`Error ${e.name}: ${e.message}`)
            setRegisterError('Something went wrong when trying to register.\nPlease try again later.\nYou can also Continue as a Guest.')
            return
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
                // set login error message
                setLoginError('Your account was created, but login failed. Please try again on the Log In page.')
                return
            }
            // get access token from json response and store it
            await setToken(json.access_token)
            // clear guest flag, not a guest anymore
            await deleteGuest();
            // redirect to recall feed (index) after login
            router.replace('/')
        }
        catch {
            // set login error message
            setLoginError('Your account was created, but login failed. Please try again on the Log In page.')
        }
    }

    {/*function called when continue as guest button pressed*/}
    async function onContinueGuest() {
        await setGuest()
        router.replace('/')
    }

    return (
        <View style={styles.authContainer}>
            <Text style={styles.title}>RecallRover</Text>
            <Text style={styles.subtitleText}>Create an account to start watching products and receive alerts!</Text>
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
                ) : emailInUse? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {emailUsedError}
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
                {emptyPassword ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {emptyPassError}
                    </Text>
                ) : !passwordsMatch ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {passMatchError}
                    </Text>
                ) : (
                    <View style={{height: 14}}/>
                )}
                <View style={{flexDirection: 'row'}}>
                    <TextInput 
                    style={styles.textinput}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    placeholder='Confirm password'
                    placeholderTextColor={'grey'}
                    secureTextEntry={secureConfirmPass}
                    />
                    <Pressable 
                        onPress={() => setSecureConfirmPass(!secureConfirmPass)}
                        style={{alignSelf: 'center'}}
                    >
                        {/*change eye icon based on password visibility*/}
                        {secureConfirmPass ? (
                            <Ionicons name="eye-off" size={30}/>
                        ) : (
                            <Ionicons name="eye" size={30}/>
                        )}

                    </Pressable> 
                </View>
                {emptyConfirmPass ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {emptyConfirmPassError}
                    </Text>
                ) : (loginError != '') ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {loginError}
                    </Text>
                ) : (registerError != '') ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {registerError}
                    </Text>
                ) : (
                    <View style={{height: 14}}/>
                )}
                <View style={{height: 14}}/>
                <View style={{flexDirection: 'row'}}>
                    <Pressable
                        onPress={onLogin}
                        style={({pressed}) =>
                            [styles.button,
                            {backgroundColor: pressed ? '#25426e' : '#4175c4'}]
                        }
                    >
                        <Text style={styles.buttonText}>
                            Log In Instead
                        </Text>
                    </Pressable>
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