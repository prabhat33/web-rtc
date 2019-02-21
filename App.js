import React, {Component} from "react";
import {Animated, Dimensions,Image, Platform,StyleSheet,PermissionsAndroid, Text, TouchableOpacity, View} from "react-native";
import {Body, Header, List, ListItem as Item, ScrollableTab, Tab, TabHeading, Tabs, Title} from "native-base";
import LinearGradient from "react-native-linear-gradient";
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    mediaDevices
} from 'react-native-webrtc';

;
import MapView from 'react-native-maps';

const {width: SCREEN_WIDTH} = Dimensions.get("window");
const IMAGE_HEIGHT = 250;
const HEADER_HEIGHT = Platform.OS === "ios" ? 64 : 50;
const SCROLL_HEIGHT = IMAGE_HEIGHT - HEADER_HEIGHT;
const THEME_COLOR = "rgba(85,186,255, 1)";
const FADED_THEME_COLOR = "rgba(85,186,255, 0.8)";

export default class App extends Component<Props>{

    constructor(props) {
        super(props);

        this.state = {
            stream:null,
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
        };
        this.nScroll.addListener(Animated.event([{value: this.scroll}], {useNativeDriver: false}));
    }


    componentDidMount() {

        const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
        const pc = new RTCPeerConnection(configuration);
        container = this;

        let isFront = true;
        mediaDevices.enumerateDevices().then(sourceInfos => {
            console.log("source infos");
            console.log(sourceInfos);
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if(sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
                    videoSourceId = sourceInfo.id;
                }
            }
            mediaDevices.getUserMedia({
                audio: true,
                video: {
                    mandatory: {
                        minWidth: 500, // Provide your own width, height and frame rate here
                        minHeight: 300,
                        minFrameRate: 30
                    },
                    facingMode: (isFront ? "user" : "environment"),
                    optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
                }
            })
                .then(stream => {
                    // Got stream!

                    console.log("got stream");
                    console.log(stream);

                    setTimeout(()=>{
                        container.setState({stream:stream.toURL()});
                    },2000)


                })
                .catch(error => {
                    // Log error
                });
        });

        pc.createOffer().then(desc => {
            pc.setLocalDescription(desc).then(() => {
                // Send pc.localDescription to peer
                console.log("inside desc");
                // console.log(desc);
            });
        });

        pc.onicecandidate = function (event) {
            // send event.candidate to peer
            console.log("inside event");

            var sd = pc.currentLocalDescription;
            if (sd) {
                console.log("Local session: type='" +
                    sd.type + "'; sdp description='" +
                    sd.sdp + "'");
            }
            else {
                console.log("No local session yet.");
            }
            // console.log(event);
        };



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


    nScroll = new Animated.Value(0);
    scroll = new Animated.Value(0);
    textColor = this.scroll.interpolate({
        inputRange: [0, SCROLL_HEIGHT / 5, SCROLL_HEIGHT],
        outputRange: [THEME_COLOR, FADED_THEME_COLOR, "white"],
        extrapolate: "clamp"
    });
    tabBg = this.scroll.interpolate({
        inputRange: [0, SCROLL_HEIGHT],
        outputRange: ["transparent", "transparent"],
        extrapolate: "clamp"
    });
    tabY = this.nScroll.interpolate({
        inputRange: [0, SCROLL_HEIGHT, SCROLL_HEIGHT + 1],
        outputRange: [0, 0, 1]
    });
    headerBg = this.scroll.interpolate({
        inputRange: [0, SCROLL_HEIGHT, SCROLL_HEIGHT + 1],
        outputRange: ["transparent", "transparent", THEME_COLOR],
        extrapolate: "clamp"
    });
    imgScale = this.nScroll.interpolate({
        inputRange: [-25, 0],
        outputRange: [1.1, 1],
        extrapolateRight: "clamp"
    });
    imgOpacity = this.nScroll.interpolate({
        inputRange: [0, SCROLL_HEIGHT],
        outputRange: [1, 0],
    });
    tabContent = (x, i) => <View style={{height: this.state.height}}>
        <List onLayout={({nativeEvent: {layout: {height}}}) => {
            this.heights[i] = height;
            if (this.state.activeTab === i) this.setState({height})
        }}>
            {new Array(x).fill(null).map((_, i) => <Item key={i}><Text>Item {i}</Text></Item>)}
        </List></View>;
    heights = [500, 500];
    state = {
        activeTab: 0,
        height: 500
    };

render(){

    if (this.state.stream !=null) {
        console.warn(this.state.stream);
        return (
            <View style={styles1.container}>
                <Text style={styles1.text}>Working On Web RTC</Text>
                <Text style={styles1.text}>{this.state.stream}</Text>
                <RTCView style={{flex:1}} streamURL={this.state.stream}  />
            </View>

        );
    }
    else {
        return (
            <View>
                <Text style={styles1.text}>Not Working On Web RTC</Text>
            </View>

        );
    }

    // return (
    //     <View>
    //         <Text style={styles.text}>Welcome to React native Web RTC</Text>
    //         <RTCView streamURL={this.state.stream.toURL()}/>
    //     </View>
    // )
}
    render1() {
        return (
            <View>
                <Animated.View style={{position: "absolute", width: "100%", backgroundColor: this.headerBg, zIndex: 1}}>
                    <Header style={{backgroundColor: "transparent"}} hasTabs>
                        <Body>
                        <Title>
                            <Animated.Text style={{color: this.textColor, fontWeight: "bold"}}>
                                Tab Parallax
                            </Animated.Text>
                        </Title>
                        </Body>
                    </Header>
                </Animated.View>
                <Animated.ScrollView
                    scrollEventThrottle={5}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event([{nativeEvent: {contentOffset: {y: this.nScroll}}}], {useNativeDriver: true})}
                    style={{zIndex: 0}}>
                    <Animated.View style={{
                        transform: [{translateY: Animated.multiply(this.nScroll, 0.65)}, {scale: this.imgScale}],
                        backgroundColor: THEME_COLOR
                    }}>

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

                        {/*<Animated.Image*/}

                            {/*style={{height: IMAGE_HEIGHT, width: "100%", opacity: this.imgOpacity}}>*/}
                            {/*/!*gradient*!/*/}
                            {/*<LinearGradient*/}
                                {/*colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}*/}
                                {/*locations={[0, 0.25, 1]}*/}
                                {/*style={{position: "absolute", height: "100%", width: "100%"}}/>*/}
                        {/*</Animated.Image>*/}
                    </Animated.View>
                    <Tabs
                        prerenderingSiblingsNumber={3}
                        onChangeTab={({i}) => {
                            this.setState({height: this.heights[i], activeTab: i})
                        }}
                        style={{backgroundColor:'rgba(0,0,0,0)'}}
                        renderTabBar={(props) => <Animated.View
                            style={{transform: [{translateY: this.tabY}], zIndex: 1, width: "100%", backgroundColor: "white"}}>
                            <ScrollableTab {...props}
                                           renderTab={(name, page, active, onPress, onLayout) => (
                                               <TouchableOpacity key={page}
                                                                 onPress={() => onPress(page)}
                                                                 onLayout={onLayout}
                                                                 activeOpacity={0.4}>
                                                   <Animated.View
                                                       style={{
                                                           flex: 1,
                                                           height: 200,
                                                           backgroundColor: this.tabBg
                                                       }}>
                                                       <TabHeading scrollable
                                                                   style={{
                                                                       backgroundColor: "transparent",
                                                                       width: SCREEN_WIDTH
                                                                   }}
                                                                   active={active}>
                                                           <Animated.Text style={{
                                                               fontWeight: active ? "bold" : "normal",
                                                               color: this.textColor,
                                                               fontSize: 14
                                                           }}>
                                                               {name}
                                                           </Animated.Text>
                                                       </TabHeading>
                                                   </Animated.View>
                                               </TouchableOpacity>
                                           )}
                                           underlineStyle={{backgroundColor: "white"}}/>
                        </Animated.View>
                        }>
                        <Tab heading="">
                            {this.tabContent(15, 1)}
                        </Tab>
                        <Tab heading="" >
                            {this.tabContent(15, 1)}
                        </Tab>



                    </Tabs>
                </Animated.ScrollView>
            </View>
        )
    }
}

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height-200;
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


const styles1 = {
    text: {
        textAlign: "center"
    },
    container: {
        flex: 1,
        width:'100%',
        backgroundColor: 'red',
        borderWidth: 1,
        borderColor: '#000'
    }
};