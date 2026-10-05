// React Native AsyncStorage file

import AsyncStorage from '@react-native-async-storage/async-storage';


/// Token functions ///

export const setToken = async (token: string) => {
    try {
        await AsyncStorage.setItem('token', token)
    }
    catch (e: any) {
        console.error(`Error ${e.name}: ${e.message}`)
    }
}

export const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (token !== null) {
            return token;
        }
    }
    catch (e: any) {
        console.error(`Error ${e.name}: ${e.message}`)
    }
}

export const deleteToken = async () => {
    try {
        await AsyncStorage.removeItem('token');
        console.log('Deleted token from AsyncStorage.')
    }
    catch (e: any) {
        console.error(`Error ${e.name}: ${e.message}`)
    }
}

/// Guest mode functions ///

export const setGuest = async () => {
    try {
        await AsyncStorage.setItem('guest', 'true')
    }
    catch (e: any) {
        console.error(`Error ${e.name}: ${e.message}`)
    }
}

export const getGuest = async () => {
    try {
        const guest = await AsyncStorage.getItem('guest')
        if (guest !== null) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (e: any) {
        console.error(`Error ${e.name}: ${e.message}`)
        return false;
    }
}

export const deleteGuest = async () => {
    try {
        await AsyncStorage.removeItem('guest');
        console.log('Deleted guest flag from AsyncStorage.')
    }
    catch (e: any) {
        console.error(`Error ${e.name}: ${e.message}`)
    }
}