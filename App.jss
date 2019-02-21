/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, PermissionsAndroid, Image} from 'react-native';
import MapView from 'react-native-maps';
import ParallaxScrollView from 'react-native-parallax-scroll-view';



// const instructions = Platform.select({
//   ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
//   android:
//     'Double tap R on your keyboard to reload,\n' +
//     'Shake or press menu button for dev menu',
// });

type Props = {};
export default class App extends Component<Props> {

    state = {
        latitude: 20.9948891,
        longitude: 105.799677,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
        region: {
            latitude: 22.580310,
            longitude: 88.428930,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002
        },
        markers: [
            {
                id: 2,
                latlng: {
                    latitude: 22.580310,
                    longitude: 88.428930
                }

            },
            {
                id: 1,
                latlng: {
                    latitude: 22.587930,
                    longitude: 88.420980
                }

            },

            {
                id: 3,
                latlng: {
                    latitude: 22.589380,
                    longitude: 88.410070
                }

            }]
    }

    componentDidMount() {

        //this.requestLocationPermission();

    }

    changePosition(lat, lon) {
        this.setState({
            region: {
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002
            }
        })

    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    async requestLocationPermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': ' App Camera Permission',
                    'message': 'This App needs access to your location ' +
                    'so you can use google maps.'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // console.log("You can use the camera")
                this.watchID = navigator.geolocation.watchPosition((position) => {
                    let region = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.015*5,
                        longitudeDelta: 0.0121*5,
                    }
                    this.changePosition(region.latitude, region.longitude);
                }, (error) => console.log(error));

            } else {
                // console.log("Camera permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
    }

    render() {
        return (
            <ParallaxScrollView
                backgroundColor="blue"
                contentBackgroundColor="pink"
                parallaxHeaderHeight={100}
                renderForeground={() => (
                    <View style={{ height: 400, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text>Hello World!</Text>
                    </View>
                )}>
                <View style={{ height: 100 }}>
                    <Text>Scroll me</Text>
                </View>
            </ParallaxScrollView>
        );
    }
    render1() {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Welcome to react-native-maps</Text>
                <MapView maxZoomLevel={14} style={styles.map} region={this.state.region} initialRegion={this.state.region}>

                    {this.state.markers.map(marker => (
                        <MapView.Marker key={marker.id}
                                        coordinate={marker.latlng}
                                        title={'Litter'}
                                        description={'Litter Description'}
                        >
                            <Image source={require('./assets/markericon@40px.png')} onLoad={() => this.forceUpdate()}/>
                        </MapView.Marker>
                    ))}

                    {/*<MapView.Marker image={require('./assets/markericon@60px.png')}  coordinate={this.state.region} />*/}

                </MapView>
            </View>
        );
    }
}

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const stylesDefault = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});


const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    text: {
        fontSize: 30,
        fontWeight: '700',
        color: '#59656C',
        marginBottom: 10,
    },
    map: {
        flex: 1,
        width,
        height
    }
};

