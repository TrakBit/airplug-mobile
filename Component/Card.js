import React, {useState, useEffect} from 'react';
import {View, ScrollView, Image} from 'react-native';
import {Title, Subheading} from 'react-native-paper';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import * as FileSystem from 'expo-file-system';

function Card({route}) {
    const {record} = route.params;
    const [uri, setUri] = useState(null);

    useEffect(() => {
        Object.entries(record).map((value) => {
            if (typeof (value[1]) === 'object') {
                value[1].map((item) => {
                    async function getImage() {
                        const fileInfo = await FileSystem.getInfoAsync(
                            FileSystem.documentDirectory + item.fileName
                        );
                        await setUri(fileInfo.uri);
                    }
                    getImage();
                });
            }
        });
    }, []);

    return (
        <View style={styles.container}>
            <View style={[{flex: 1}, styles.elementsContainer]}>
                <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                    <ScrollView>
                        {
                            Object.entries(record).map((value, i) => {
                                return (
                                    <View key={i}>
                                        <Title style={{fontFamily: 'Rubik_500Medium'}}>{value[0]}{':'}</Title>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                flexWrap: 'wrap'
                                            }}
                                        >
                                            <Content
                                                value={value[1]}
                                                uri={uri}
                                                setUri={setUri}
                                            />
                                        </View>
                                    </View>
                                );
                            })
                        }
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const Content = ({value, uri}) => {
    if (typeof (value) === 'object') {
        return value.map((item, i) => {
            if (typeof (item) === 'object' && 'url' in item) {
                return (
                    <View
                        key={i}
                        style={{
                            marginTop: 8
                        }}
                    >
                        {
                            uri &&
                            <Image
                                source={{uri}}
                                style={{height: 250, width: wp(100)}}
                            />}
                    </View>
                );
            } else {
                return (
                    <View
                        key={i}
                        style={{
                            backgroundColor: '#ecfbfc',
                            marginLeft: 8,
                            marginTop: 8,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderColor: '#00bcd4'
                        }}
                    >
                        <Subheading style={{fontFamily: 'Rubik_400Regular'}}>&nbsp;{item}&nbsp;</Subheading>
                    </View>
                );
            }
        });
    } else {
        return (
            <Subheading>{value}</Subheading>
        );
    }
};

const styles = {
    container: {
        backgroundColor: '#FFFFFF',
        paddingTop: 48,
        flex: 1
    },
    headerStyle: {
        color: '#5E72E4',
        fontSize: 36,
        textAlign: 'center',
        fontWeight: '100',
        marginBottom: 24,
        fontFamily: 'Rubik_500Medium'
    },
    elementsContainer: {
        backgroundColor: '#FFFFFF',
        marginLeft: 24,
        marginRight: 24,
        marginBottom: 24
    }
};

export default Card;