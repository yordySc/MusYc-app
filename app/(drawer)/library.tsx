import React, { useEffect, useState } from 'react';
import { ScrollView, View, Modal, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ThemeView, ThemeText, useTheme } from '../../components/Theme';
import IconItem from '../../components/IconItem';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as WebBrowser from 'expo-web-browser';

interface RepertoireItem {
  id: number;
  title: string;
  difficulty_level: string;
  pdf_url: string;
  created_by_user_id: string | null;
  is_public: boolean;
  genre: string | null;
  instrumentation: string | null;
  created_at: string;
}

const LibraryScreen: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [items, setItems] = useState<RepertoireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('Todos');
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<RepertoireItem | null>(null);
  const [showMenu, setShowMenu] = useState<number | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newLevel, setNewLevel] = useState<string>('Principiante');
  const [newGenre, setNewGenre] = useState('');
  const [newInstrumentation, setNewInstrumentation] = useState('');
  const [selectedPdfUri, setSelectedPdfUri] = useState<string | null>(null);
  const [newIsPublic, setNewIsPublic] = useState(true);

  const colors = {
    bgCard: isDark ? '#1A2E33' : '#FFFFFF',
    border: isDark ? '#374151' : '#E5E7EB',
    text: isDark ? '#F0F9FF' : '#132E32',
    textSecondary: isDark ? '#D1D5DB' : '#6B7280',
    bg: isDark ? '#0D1B1F' : '#F5F7FA',
  };

  useEffect(() => {
    fetchRepertoire();
  }, []);

  const fetchRepertoire = async () => {
    try {
      setLoading(true);
      let query = supabase.from('repertoire').select('*').order('created_at', { ascending: false });

      if (user?.id) {
        const { data, error } = await query;
        if (error) throw error;
        const filtered = (data || []).filter(
          item => item.is_public === true || item.created_by_user_id === user.id
        );
        setItems(filtered);
      } else {
        const { data, error } = await query.eq('is_public', true);
        if (error) throw error;
        setItems(data || []);
      }
    } catch (err) {
      // Error fetching repertoire
      Alert.alert('Error', 'No se pudieron cargar las partituras');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Avanzado': return '#EF4444';
      case 'Intermedio': return '#84FFC6';
      default: return '#132E32';
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedPdfUri(uri);
        Alert.alert('Éxito', 'PDF seleccionado correctamente');
      } else if (!result.canceled) {
        Alert.alert('Error', 'No se pudo obtener la ruta del PDF');
      }
    } catch (err) {
      // Error picking document
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleUpload = async () => {
    if (!newTitle.trim()) return Alert.alert('Error', 'El título es requerido');
    if (!selectedPdfUri && !editingItem) return Alert.alert('Error', 'Debes seleccionar un PDF');
    if (!user?.id) return Alert.alert('Error', 'Usuario no autenticado');

    if (editingItem) {
      return handleUpdate();
    }

    try {
      setUploading(true);

      const fileName = `${Date.now()}-${newTitle.replace(/\s+/g, '_')}.pdf`;
      const fileContent = await FileSystem.readAsStringAsync(selectedPdfUri!, { encoding: 'base64' });
      const base64data = fileContent;
      const binaryString = atob(base64data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

      const { data: storageData, error: storageError } = await supabase.storage.from('repertoire').upload(fileName, bytes, { contentType: 'application/pdf' });
      if (storageError) throw storageError;

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('repertoire').createSignedUrl(fileName, 365 * 24 * 60 * 60);
      if (signedUrlError) throw signedUrlError;

      const publicUrl = signedUrlData.signedUrl;

      const { error: insertError } = await supabase.from('repertoire').insert([{ title: newTitle, difficulty_level: newLevel, pdf_url: publicUrl, created_by_user_id: user.id, is_public: newIsPublic, genre: newGenre || null, instrumentation: newInstrumentation || null }]);

      if (insertError) throw insertError;

      Alert.alert('Éxito', 'Partitura subida correctamente');
      setUploadOpen(false);
      setNewTitle('');
      setNewLevel('Principiante');
      setNewGenre('');
      setNewInstrumentation('');
      setSelectedPdfUri(null);
      setNewIsPublic(true);
      await fetchRepertoire();
    } catch (err) {
      // Error uploading
      Alert.alert('Error', `No se pudo subir la partitura: ${err}`);
    } finally {
      setUploading(false);
    }
  };

  const toggleVisibility = async (item: RepertoireItem) => {
    if (item.created_by_user_id !== user?.id) {
      return Alert.alert('Error', 'Solo puedes editar tus propias partituras');
    }

    try {
      const { error } = await supabase
        .from('repertoire')
        .update({ is_public: !item.is_public })
        .eq('id', item.id);

      if (error) throw error;
      await fetchRepertoire();
    } catch (err) {
      // Error toggling visibility
      Alert.alert('Error', 'No se pudo cambiar la visibilidad');
    }
  };

  const deleteItem = async (item: RepertoireItem) => {
    if (item.created_by_user_id !== user?.id) {
      return Alert.alert('Error', 'Solo puedes eliminar tus propias partituras');
    }

    Alert.alert('Eliminar partitura', '¿Estás seguro de que deseas eliminar esta partitura?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            const { error: deleteError } = await supabase.from('repertoire').delete().eq('id', item.id);

            if (deleteError) throw deleteError;

            try {
              const url = new URL(item.pdf_url);
              const pathParts = url.pathname.split('/');
              const fileName = pathParts[pathParts.length - 1];
              if (fileName) {
                const { error: storageError } = await supabase.storage.from('repertoire').remove([fileName]);
                if (storageError) {
                  // Storage deletion error (non-blocking)
                }
              }
            } catch (storageErr) {
              // Storage deletion error (non-blocking)
            }

            Alert.alert('Éxito', 'Partitura eliminada correctamente');
            await fetchRepertoire();
          } catch (err) {
            // Error deleting
            Alert.alert('Error', 'No se pudo eliminar la partitura');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const editItem = (item: RepertoireItem) => {
    setEditingItem(item);
    setNewTitle(item.title);
    setNewLevel(item.difficulty_level);
    setNewGenre(item.genre || '');
    setNewInstrumentation(item.instrumentation || '');
    setUploadOpen(true);
    setShowMenu(null);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    if (!newTitle.trim()) return Alert.alert('Error', 'El título es requerido');

    try {
      setUploading(true);
      const { error } = await supabase
        .from('repertoire')
        .update({
          title: newTitle,
          difficulty_level: newLevel,
          genre: newGenre || null,
          instrumentation: newInstrumentation || null,
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      Alert.alert('Éxito', 'Partitura actualizada correctamente');
      setUploadOpen(false);
      setEditingItem(null);
      setNewTitle('');
      setNewLevel('Principiante');
      setNewGenre('');
      setNewInstrumentation('');
      await fetchRepertoire();
    } catch (err) {
      // Error updating
      Alert.alert('Error', 'No se pudo actualizar la partitura');
    } finally {
      setUploading(false);
    }
  };

  const filtered = items.filter(it => {
    if (filterLevel !== 'Todos' && it.difficulty_level !== filterLevel) return false;
    return true;
  });

  return (
    <ThemeView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <ThemeText style={{ fontSize: 28, fontWeight: 'bold', color: colors.text }}>Biblioteca</ThemeText>
          <Pressable
            onPress={() => setUploadOpen(true)}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#84FFC6' }}
          >
            <ThemeText style={{ fontSize: 14, fontWeight: '600', color: '#132E32' }}>+ Subir</ThemeText>
          </Pressable>
        </View>

        
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {['Todos', 'Principiante', 'Intermedio', 'Avanzado'].map(level => (
            <Pressable
              key={level}
              onPress={() => setFilterLevel(level)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filterLevel === level ? '#132E32' : colors.bgCard,
                borderWidth: 1,
                borderColor: filterLevel === level ? '#132E32' : colors.border,
              }}
            >
              <ThemeText style={{ fontSize: 12, color: filterLevel === level ? '#FFFFFF' : colors.text }}>
                {level}
              </ThemeText>
            </Pressable>
          ))}
        </View>

        
        {loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <ActivityIndicator size="large" color="#84FFC6" />
          </View>
        ) : filtered.length === 0 ? (
          <ThemeText style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 24 }}>
            No hay partituras disponibles
          </ThemeText>
        ) : (
          <View style={{ gap: 12, paddingBottom: 24 }}>
            {filtered.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (item.pdf_url) {
                    WebBrowser.openBrowserAsync(item.pdf_url);
                  }
                }}
                style={{
                  backgroundColor: colors.bgCard,
                  borderRadius: 12,
                  padding: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: '#84FFC6',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ThemeText style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        {item.title}
                      </ThemeText>
                      {!item.is_public && (
                        <ThemeText style={{ fontSize: 10, fontWeight: 'bold', color: '#FFD015', backgroundColor: 'rgba(255, 208, 21, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          PRIVADO
                        </ThemeText>
                      )}
                    </View>
                    <ThemeText style={{ fontSize: 12, marginTop: 4, color: colors.textSecondary }}>
                      {item.instrumentation || 'Varios'}
                    </ThemeText>
                  </View>
                  <ThemeText style={{ fontSize: 10, fontWeight: 'bold', color: getLevelColor(item.difficulty_level) }}>
                    {item.difficulty_level.toUpperCase()}
                  </ThemeText>
                </View>

                {item.genre && (
                  <ThemeText style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                    Género: {item.genre}
                  </ThemeText>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <ThemeText style={{ fontSize: 12, color: '#84FFC6', fontWeight: '600' }}>
                    Ver Partitura
                  </ThemeText>
                  <IconItem type="Ionicons" name="download-outline" size={18} color="#84FFC6" />
                </View>

                
                {item.created_by_user_id === user?.id && (
                  <View style={{ marginTop: 12, gap: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      
                      <Pressable
                        onPress={() => toggleVisibility(item)}
                        style={{
                          flex: 1,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: item.is_public ? '#84FFC6' : '#FFD015',
                        }}
                      >
                        <ThemeText style={{ fontSize: 11, fontWeight: '600', color: '#132E32', textAlign: 'center' }}>
                          {item.is_public ? 'Público' : 'Privado'}
                        </ThemeText>
                      </Pressable>

                      
                      <Pressable
                        onPress={() => editItem(item)}
                        style={{
                          flex: 1,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: '#8B5CF6',
                        }}
                      >
                        <ThemeText style={{ fontSize: 11, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' }}>
                          Editar
                        </ThemeText>
                      </Pressable>

                      
                      <Pressable
                        onPress={() => deleteItem(item)}
                        style={{
                          flex: 1,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: '#EF4444',
                        }}
                      >
                        <ThemeText style={{ fontSize: 11, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' }}>
                          Eliminar
                        </ThemeText>
                      </Pressable>
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      
      <Modal visible={uploadOpen} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 400,
              backgroundColor: colors.bgCard,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <ThemeText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: colors.text }}>
              {editingItem ? 'Editar Partitura' : 'Subir Partitura'}
            </ThemeText>

            <TextInput
              placeholder="Título"
              value={newTitle}
              onChangeText={setNewTitle}
              style={{
                backgroundColor: colors.bg,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                marginBottom: 12,
              }}
              placeholderTextColor={colors.textSecondary}
            />

            <View style={{ marginBottom: 12 }}>
              <ThemeText style={{ fontSize: 12, marginBottom: 8, color: colors.textSecondary }}>
                Dificultad
              </ThemeText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['Principiante', 'Intermedio', 'Avanzado'].map(level => (
                  <Pressable
                    key={level}
                    onPress={() => setNewLevel(level)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: newLevel === level ? '#84FFC6' : colors.border,
                    }}
                  >
                    <ThemeText style={{ fontSize: 11, color: newLevel === level ? '#132E32' : colors.text }}>
                      {level}
                    </ThemeText>
                  </Pressable>
                ))}
              </View>
            </View>

            <TextInput
              placeholder="Género (opcional)"
              value={newGenre}
              onChangeText={setNewGenre}
              style={{
                backgroundColor: colors.bg,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                marginBottom: 12,
              }}
              placeholderTextColor={colors.textSecondary}
            />

            <TextInput
              placeholder="Instrumentación (opcional)"
              value={newInstrumentation}
              onChangeText={setNewInstrumentation}
              style={{
                backgroundColor: colors.bg,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                marginBottom: 12,
              }}
              placeholderTextColor={colors.textSecondary}
            />

            {!editingItem && (
              <>
                <View style={{ marginBottom: 12 }}>
                  <ThemeText style={{ fontSize: 12, marginBottom: 8, color: colors.textSecondary }}>
                    Visibilidad
                  </ThemeText>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable onPress={() => setNewIsPublic(true)} style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: newIsPublic ? '#84FFC6' : colors.border }}>
                      <ThemeText style={{ fontSize: 12, color: newIsPublic ? '#132E32' : colors.text, textAlign: 'center', fontWeight: '600' }}>Público</ThemeText>
                    </Pressable>
                    <Pressable onPress={() => setNewIsPublic(false)} style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: !newIsPublic ? '#FFD015' : colors.border }}>
                      <ThemeText style={{ fontSize: 12, color: !newIsPublic ? '#132E32' : colors.text, textAlign: 'center', fontWeight: '600' }}>Privado</ThemeText>
                    </Pressable>
                  </View>
                </View>
              </>
            )}

            {!editingItem && (
              <Pressable
                onPress={pickDocument}
                style={{
                  backgroundColor: selectedPdfUri ? '#84FFC6' : colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: selectedPdfUri ? '#84FFC6' : colors.border,
                }}
              >
                <ThemeText style={{ fontSize: 14, color: selectedPdfUri ? '#132E32' : colors.text, textAlign: 'center', fontWeight: selectedPdfUri ? '700' : '500' }}>
                  {selectedPdfUri ? '✓ PDF Seleccionado' : 'Seleccionar PDF'}
                </ThemeText>
              </Pressable>
            )}

            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
              <Pressable
                onPress={() => {
                  setUploadOpen(false);
                  setEditingItem(null);
                  setNewTitle('');
                  setNewLevel('Principiante');
                  setNewGenre('');
                  setNewInstrumentation('');
                  setSelectedPdfUri(null);
                  setNewIsPublic(true);
                }}
                disabled={uploading}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: colors.border,
                }}
              >
                <ThemeText style={{ fontSize: 14, color: colors.text }}>Cancelar</ThemeText>
              </Pressable>

              <Pressable
                onPress={handleUpload}
                disabled={uploading}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: '#84FFC6',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? (
                  <ActivityIndicator color="#132E32" />
                ) : (
                  <ThemeText style={{ fontSize: 14, fontWeight: '600', color: '#132E32' }}>
                    {editingItem ? 'Actualizar' : 'Subir'}
                  </ThemeText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemeView>
  );
};

export default LibraryScreen;