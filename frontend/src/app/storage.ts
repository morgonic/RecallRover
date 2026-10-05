// React Native AsyncStorage file

import AsyncStorage from '@react-native-async-storage/async-storage';


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