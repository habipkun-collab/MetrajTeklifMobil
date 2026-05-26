import * as FileSystem from 'expo-file-system';

export async function saveFileLocally(uri: string, name?: string) {
  try {
    const filename = name || uri.split('/').pop() || `file-${Date.now()}`;
    const dest = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.copyAsync({ uri, to: dest });
    return dest;
  } catch (err) {
    console.error('saveFileLocally error', err);
    throw err;
  }
}
