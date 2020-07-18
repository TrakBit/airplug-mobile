import React, {useState, useEffect} from 'react';
import * as SQLite from 'expo-sqlite';
import {View, ScrollView} from 'react-native';
import {List, Button} from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

function Row({route, navigation}) {
    const db = SQLite.openDatabase('db.db');
    const [rows, setRows] = useState([]);

    const {table_id} = route.params;

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

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql('select * from records where table_id = (?)', [table_id], (_, {rows: {_array}}) => {
                setRows(_array);
            });
        });
    }, []);

    return (
        <View style={styles.container}>
            <View style={[{flex: 1}, styles.elementsContainer]}>
                <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                    <ScrollView>
                        {
                            rows.map((value, i) => {
                                return (
                                    <List.Item
                                        key={i}
                                        title={JSON.parse(value.record)[Object.keys(JSON.parse(value.record))[0]]}
                                        style={{backgroundColor: '#e4f9ff', marginTop: 10}}
                                        left={
                                            () => {
                                                return (
                                                    <Button
                                                        onPress={() => selectRow(JSON.parse(value.record))}
                                                        icon='folder'
                                                    />
                                                );
                                            }
                                        }
                                        right={
                                            () => {
                                                return (
                                                    <Button
                                                        onPress={() => downloadAttachment(value.attachment)}
                                                        icon='download'
                                                    />
                                                );
                                            }
                                        }
                                    />
                                );
                            })
                        }
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

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

export default Row;