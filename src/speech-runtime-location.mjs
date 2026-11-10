import {join} from 'node:path';

export function speechRuntimeDirectory(metadataRoot){
 return join(metadataRoot,'speech-runtime','streaming-v1');
}
