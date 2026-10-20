// StyleSheet file for all pages

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 50
    },
    authContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#3a3a3a1e',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50
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
    smallSubtitleText: {
        color: '#000',
        fontSize: 16,
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
    activeNavButton: {
        fontSize: 18,
        textDecorationLine: 'underline',
        color: '#000',
        marginTop: 20,
        marginHorizontal: 10,
        fontWeight: 'bold'
    },
    navButtonDivider: {
        fontSize: 18,
        color: '#000',
        marginTop: 20,
        marginHorizontal: 10,
        marginVertical: 30
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
        alignSelf: 'center',
        resizeMode: 'contain'
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
    },
    statusLabel: {
        padding: 10,
        borderRadius: 20,
        borderWidth: 2
    },
    statusLabelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    watchedProductName: {
        color: '#000',
        fontSize: 22,
        fontWeight: '600',
        marginTop: 10,
        textAlign: 'center'
    },
    watchedBrandModel: {
        color: '#000',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 10,
        textAlign: 'center'
    },
    removeButton: {
        backgroundColor: "#c44141",
        flex: 1,
        justifyContent: 'center',
        height: 40,
        width: 100,
        borderRadius: 10,
        margin: 10,
        padding: 10
    },
    editButton: {
        backgroundColor: "#69707c",
        flex: 1,
        justifyContent: 'center',
        height: 40,
        width: 100,
        borderRadius: 10,
        margin: 10,
        padding: 10
    },
    detailsTitle: {
        color: '#000',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20
    },
    recallTitle: {
        color: '#000',
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'left',
        marginTop: 20
    },
    detailsHeader: {
        color: '#000',
        fontSize: 20,
        fontWeight: '700',
        textDecorationLine: 'underline',
        textAlign: 'left',
        marginBottom: 20
    },
    detailsText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'left',
        marginBottom: 20
    },
    textLink: {
        color: '#4176c4',
        textDecorationLine: 'underline',
        fontSize: 20,
        fontWeight: '600'
    },
    detailsButton: {
        backgroundColor: '#eff0f1',
        justifyContent: 'center',
        height: 60,
        width: 180,
        borderRadius: 40,
        borderColor: '#474e5a',
        borderWidth: 2,
        margin: 10,
        padding: 10
    },
    detailsButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    detailsImage: {
        aspectRatio: 4/3,
        width: '100%',
        marginTop: 20,
        resizeMode: 'contain'
    },
    loadMoreView: {
        alignItems: 'center', 
        marginBottom: 30, 
        marginTop: 10
    },
    cameraView: {
        width: '80%',
        height: '80%'
    },
    captureButton: {
        backgroundColor: "#4175c4",
        justifyContent: 'center',
        height: 80,
        width: 80,
        borderRadius: 40,
        borderColor: '#25426e',
        borderWidth: 2
    },
    filterButton: {
        backgroundColor: '#474e5a',
        justifyContent: 'center',
        height: 50,
        width: 150,
        borderRadius: 40,
        borderColor: '#1e2125',
        borderWidth: 2,
        margin: 5,
        padding: 10
    },
    filterButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    applyFilterButton: {
        backgroundColor: '#eff0f1',
        justifyContent: 'center',
        height: 50,
        width: 150,
        borderRadius: 40,
        borderColor: '#474e5a',
        borderWidth: 2,
        margin: 5,
        padding: 10
    }
})