import React, { useEffect, useState } from 'react';
import { ScrollView, View, Modal, Pressable, TextInput, Alert } from 'react-native';
import { ThemeView, ThemeText } from '../../components/Theme';
import ThemeCard from '../../components/ThemeCard';
import IconItem from '../../components/IconItem';
import { useAuth } from '../../context/AuthContext';
import { RepertoireItem, getRepertoire, addRepertoireItem, getUserUploads, addUserUpload, togglePublish } from '../../utils/libraryStore';

const LibraryScreen: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<RepertoireItem[]>([]);
  const [open, setOpen] = useState<RepertoireItem | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('Todos');
  const [filterInstrument, setFilterInstrument] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'Todos'|'Publicos'|'Mis Partituras'>('Todos');

  // Admin / upload state
  const [adminOpen, setAdminOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Partitura');
  const [newInstrument, setNewInstrument] = useState('');
  const [newLevel, setNewLevel] = useState<RepertoireItem['level']>('Principiante');
  const [uploadUri, setUploadUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const repo = await getRepertoire();
      const uploads = await getUserUploads(user?.id);
      // combine system repo + public uploads + user's own uploads
      const publicUploads = uploads.filter(u => u.public);
      const combined = [...repo, ...publicUploads, ...uploads.filter(u => u.owner === user?.id)];
      setItems(combined);
    })();
  }, [user?.id]);

  const refresh = async () => {
    const repo = await getRepertoire();
    const uploads = await getUserUploads(user?.id);
    const publicUploads = uploads.filter(u => u.public);
    const combined = [...repo, ...publicUploads, ...uploads.filter(u => u.owner === user?.id)];
    setItems(combined);
  };

  const getLevelColor = (level: RepertoireItem['level']) => {
      switch (level) {
          case 'Avanzado': return 'text-red-400';
          case 'Intermedio': return 'text-secondary dark:text-secondary';
          default: return 'text-primary dark:text-primary';
      }
  };

  const filtered = items.filter(it => {
    if (viewMode === 'Publicos' && it.public !== true && it.owner !== 'system') return false;
    if (viewMode === 'Mis Partituras' && it.owner !== user?.id) return false;
    if (filterLevel !== 'Todos' && it.level !== filterLevel) return false;
    if (filterInstrument !== 'Todos' && it.instrument !== filterInstrument) return false;
    if (filterText && !`${it.title} ${it.type} ${it.instrument}`.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  const handleAddGlobal = async () => {
    if (!newTitle) return Alert.alert('Título requerido');
    await addRepertoireItem({ title: newTitle, type: newType, instrument: newInstrument || 'Varios', level: newLevel, owner: 'system', public: true });
    setAdminOpen(false);
    setNewTitle(''); setNewType('Partitura'); setNewInstrument(''); setNewLevel('Principiante');
    await refresh();
  };

  const pickDocument = async () => {
    try {
      // dynamic import to avoid bundling errors if package missing
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DocumentPicker = require('expo-document-picker');
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (res.type === 'success') {
        setUploadUri(res.uri);
      }
    } catch (err) {
      console.warn('DocumentPicker not available', err);
      Alert.alert('No soportado', 'El selector de archivos no está disponible. Pega una URL en su lugar.');
    }
  };

  const handleUserUpload = async () => {
    if (!newTitle) return Alert.alert('Título requerido');
    const item = await addUserUpload(user?.id, { title: newTitle, type: newType, instrument: newInstrument || 'Varios', level: newLevel, public: true, fileUri: uploadUri || null });
    setUploadOpen(false);
    setNewTitle(''); setUploadUri(null);
    await refresh();
  };

  const handleTogglePublish = async (it: RepertoireItem) => {
    if (!it.owner || it.owner === 'system') return;
    await togglePublish(it.owner, it.id, !it.public);
    await refresh();
  };

  return (
    <ThemeView className="p-4 bg-background-light dark:bg-background-dark flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="py-3">
        <ThemeText className="text-3xl font-poppins-bold mb-2 text-[#132E32] dark:text-white">Biblioteca Musical</ThemeText>

        <ThemeText className="text-sm text-gray-500 dark:text-gray-300 mb-4">Filtra por nivel, instrumento o busca por título</ThemeText>

        <View className="flex-row items-center gap-2 mb-3">
          <TextInput placeholder="Buscar..." value={filterText} onChangeText={setFilterText} className="flex-1 bg-white/5 px-3 py-2 rounded-xl" />
          <Pressable onPress={() => { setAdminOpen(true); }} className="px-3 py-2 rounded-xl bg-white/10">
            <ThemeText className="text-sm text-[#132E32] dark:text-white">Admin</ThemeText>
          </Pressable>
          <Pressable onPress={() => { setUploadOpen(true); }} className="px-3 py-2 rounded-xl bg-white/10">
            <ThemeText className="text-sm text-[#132E32] dark:text-white">Subir</ThemeText>
          </Pressable>
        </View>

        <View className="flex-row gap-2 mb-4">
          {(['Todos','Principiante','Intermedio','Avanzado'] as const).map(l => (
            <Pressable key={l} onPress={() => setFilterLevel(l as any)} className={`px-3 py-2 rounded-full ${filterLevel===l ? 'bg-[#132E32]' : 'bg-white/10'}`}>
              <ThemeText className={`${filterLevel===l ? 'text-white' : 'text-[#132E32] dark:text-white'}`}>{l}</ThemeText>
            </Pressable>
          ))}
        </View>

        <View className="flex-row gap-2 mb-3">
          {(['Todos','Publicos','Mis Partituras'] as const).map(m => (
            <Pressable key={m} onPress={() => setViewMode(m)} className={`px-3 py-2 rounded-full ${viewMode===m ? 'bg-[#84FFC6]' : 'bg-white/10'}`}>
              <ThemeText className={`${viewMode===m ? 'text-[#132E32]' : 'text-[#132E32] dark:text-white'}`}>{m}</ThemeText>
            </Pressable>
          ))}
        </View>

        <View className="space-y-3">
          {filtered.map((item) => (
            <Pressable key={item.id} onPress={() => setOpen(item)}>
              <ThemeCard className="mb-1" borderStyle="left-accent">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <ThemeText className="text-lg font-poppins-semibold text-[#132E32] dark:text-white">{item.title}</ThemeText>
                    <ThemeText className="text-sm mt-1 text-gray-500 dark:text-gray-400">{item.type} • {item.instrument}</ThemeText>
                  </View>
                  <ThemeText className={`text-xs font-poppins-bold ${getLevelColor(item.level)}`}>{item.level.toUpperCase()}</ThemeText>
                </View>

                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                  <ThemeText className="text-xs text-[#84FFC6] font-poppins-semibold">Ver Partitura</ThemeText>
                  <IconItem type="Ionicons" name="arrow-down-circle-outline" size={24} color="#84FFC6" />
                </View>
                {item.owner && item.owner !== 'system' && (
                  <View className="mt-2">
                    <ThemeText className="text-xs text-gray-500">Subida por: {item.owner === user?.id ? 'Tú' : item.owner}</ThemeText>
                    <View className="flex-row gap-2 mt-2">
                      <Pressable onPress={() => handleTogglePublish(item)} className="px-3 py-1 rounded-full bg-white/10">
                        <ThemeText className="text-sm text-[#132E32]">{item.public ? 'Hacer privada' : 'Hacer pública'}</ThemeText>
                      </Pressable>
                    </View>
                  </View>
                )}
              </ThemeCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Modal detalle */}
      <Modal visible={!!open} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="w-full max-w-lg bg-white rounded-2xl p-6">
            {open && (
              <>
                <ThemeText className="text-2xl font-poppins-bold mb-2">{open.title}</ThemeText>
                <ThemeText className="text-sm text-gray-600 mb-4">{open.type} • {open.instrument}</ThemeText>
                <ThemeText className="text-base text-gray-700 mb-4">{open.fileUri ? 'Partitura disponible (toca para descargar/ver).' : 'Vista previa no disponible.'}</ThemeText>
                {open.fileUri ? (
                  <Pressable onPress={() => Alert.alert('Abrir archivo', open.fileUri || '')} className="px-4 py-2 rounded-xl bg-white/10">
                    <ThemeText className="text-[#132E32]">Abrir PDF</ThemeText>
                  </Pressable>
                ) : null}
              </>
            )}

            <View className="flex-row justify-end mt-6">
                <Pressable onPress={() => setOpen(null)} className="px-4 py-2 rounded-full bg-[#84FFC6]">
                <ThemeText className="font-poppins-bold text-[#132E32] dark:text-[#132E32]">Cerrar</ThemeText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Admin modal */}
      <Modal visible={adminOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-center items-center p-6">
          <View className="w-full max-w-lg bg-white rounded-2xl p-6">
            <ThemeText className="text-xl font-poppins-bold mb-3">Agregar partitura (global)</ThemeText>
            <TextInput placeholder="Título" value={newTitle} onChangeText={setNewTitle} className="bg-white/5 px-3 py-2 rounded-xl mb-2" />
            <TextInput placeholder="Instrumento" value={newInstrument} onChangeText={setNewInstrument} className="bg-white/5 px-3 py-2 rounded-xl mb-2" />
            <TextInput placeholder="Tipo" value={newType} onChangeText={setNewType} className="bg-white/5 px-3 py-2 rounded-xl mb-2" />
            <View className="flex-row justify-end gap-2 mt-4">
              <Pressable onPress={() => setAdminOpen(false)} className="px-4 py-2 rounded-full bg-white/10">
                <ThemeText className="text-[#132E32]">Cancelar</ThemeText>
              </Pressable>
              <Pressable onPress={handleAddGlobal} className="px-4 py-2 rounded-full bg-[#132E32]">
                <ThemeText className="text-white">Agregar</ThemeText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload modal (user) */}
      <Modal visible={uploadOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-center items-center p-6">
          <View className="w-full max-w-lg bg-white rounded-2xl p-6">
            <ThemeText className="text-xl font-poppins-bold mb-3">Subir partitura</ThemeText>
            <TextInput placeholder="Título" value={newTitle} onChangeText={setNewTitle} className="bg-white/5 px-3 py-2 rounded-xl mb-2" />
            <TextInput placeholder="Instrumento" value={newInstrument} onChangeText={setNewInstrument} className="bg-white/5 px-3 py-2 rounded-xl mb-2" />
            <TextInput placeholder="Tipo" value={newType} onChangeText={setNewType} className="bg-white/5 px-3 py-2 rounded-xl mb-2" />

            <View className="flex-row items-center gap-2 mb-3">
              <Pressable onPress={pickDocument} className="px-3 py-2 rounded-full bg-white/10">
                <ThemeText className="text-[#132E32]">Seleccionar PDF</ThemeText>
              </Pressable>
              <ThemeText className="text-sm text-gray-500">{uploadUri ? 'Archivo seleccionado' : 'Ningún archivo'}</ThemeText>
            </View>

            <View className="flex-row justify-end gap-2 mt-4">
              <Pressable onPress={() => setUploadOpen(false)} className="px-4 py-2 rounded-full bg-white/10">
                <ThemeText className="text-[#132E32]">Cancelar</ThemeText>
              </Pressable>
              <Pressable onPress={handleUserUpload} className="px-4 py-2 rounded-full bg-[#132E32]">
                <ThemeText className="text-white">Subir</ThemeText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemeView>
  );
};

export default LibraryScreen;