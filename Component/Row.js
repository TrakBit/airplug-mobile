import React, {useState, useEffect} from 'react';
import * as SQLite from 'expo-sqlite';
import {SafeAreaView, View, FlatList, StyleSheet, Text, StatusBar} from 'react-native';
import {Button} from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

const Row = ({route, navigation}) => {
    const db = SQLite.openDatabase('db.db');
    const [rows, setRows] = useState([]);
    const {table_id} = route.params;

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql('select * from records where table_id = (?)', [table_id], (_, {rows: {_array}}) => {
                setRows(_array);
            });
        });
    }, []);

    const selectRow = async (record) => {
        function setConfig() {
            const records = [];
            Object.entries(record).forEach((value) => {
                const images = value[1];
                if (typeof (images) === 'object') {
                    images.forEach(async (item, i) => {
                        if (typeof (item) === 'object' && 'url' in item) {
                            const image = await SecureStore.getItemAsync(item.id);
                            await records.push(image);
                            if ((images.length - 1) === i) {
                                navigation.navigate('Card', {record, records});
                            }
                        }
                    });
                }
            });
        }

        setConfig();
    };

    const downloadAttachment = (attachment) => {
        const attachments = JSON.parse(attachment);
        attachments.forEach((item) => {
            const fileName = item.id;
            const fileUri = FileSystem.documentDirectory + fileName;
            FileSystem.downloadAsync(
                item.url,
                fileUri
            );
            SecureStore.setItemAsync(fileName, fileUri);
        });
    };

    const Item = ({item}) => (
        <View style={styles.items}>
            <View style={styles.left}>
                <Button
                    icon='folder'
                    onPress={() => selectRow(JSON.parse(item.record))}
                />
            </View>
            <View style={styles.item}>
                <Text style={styles.title}>{item.name}</Text>
            </View>
            <View style={styles.right}>
                <Button
                    icon='download'
                    onPress={() => downloadAttachment(item.attachment)}
                />
            </View>
        </View>
    );

    const renderItem = ({item}) => (
        <Item item={item}/>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={rows}
                renderItem={renderItem}
                keyExtractor={(item) => item.record_id}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0
    },
    items: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        backgroundColor: '#fff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16
    },
    left: {
        width: '20%'
    },
    right: {
        width: '20%'
    },
    item: {
        width: '60%'
    },
    title: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: 'Rubik_500Medium'
    }
});

export default Row;
