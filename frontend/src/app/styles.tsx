// StyleSheet file for all pages

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        color: '#000',
        fontSize: 28,
        fontWeight: 'bold',
        margin: 20,
    },
    subtitleText: {
        color: '#000',
        fontSize: 20,
        fontWeight: '600',
        margin: 20,
    },
    textinput: {
        height: 50,
        width: 300,
        margin: 10,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
    },
    button: {
        backgroundColor: "#4175c4",
        flex: 1,
        justifyContent: 'center',
        height: 50,
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
        fontWeight: '500',
        color: '#242424'
    },
    navButton: {
        fontSize: 18,
        textDecorationLine: 'underline',
        color: '#000',
        marginTop: 20,
        marginHorizontal: 10
    },
    navigationBar: {
        flexDirection: 'row'
    },
    searchButton: {
        backgroundColor: "#4175c4",
        flex: 1,
        justifyContent: 'center',
        height: 50,
        width: 50,
        borderRadius: 10,
        margin: 10,
        padding: 10,
        alignItems: 'center'
    },
    resultsCard: {
        backgroundColor: '#4176c43b',
        shadowColor: '#0c1524a8',
        shadowOffset: {width: 4, height: 4},
        shadowRadius: 2,
        height: 400,
        width: 300,
        borderRadius: 10,
        margin: 10,
        padding: 20
    },
    resultsTitle: {
        color: '#000',
        fontSize: 18,
        fontWeight: '700'
    },
    resultsDate: {
        color: '#292929',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 5
    },
    resultsImage: {
        height: 150,
        width: 200,
        marginTop: 20,
        alignSelf: 'center'
    },
    resultsProductName: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
        textAlign: 'center'
    },
    resultsHazard: {
        color: '#2b0101',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 10,
        textAlign: 'center'
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 4
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        margin: 20,
        padding: 20
    },
    watchedProductButton: {
        backgroundColor: '#4176c4',
        height: 50,
        width: 200,
        borderRadius: 10
    },
    wpButtonText: {
        fontSize: 20,
        color: '#fff',
        justifyContent: 'center',
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        margin: 10
    }
})