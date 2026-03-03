import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

type AttachedImage = {
  id: string;
  uri: string;
  revocable: boolean;
};

type CommunityComposerProps = {
  isDarkMode: boolean;
  backgroundColor: string;
};

const MAX_ATTACHMENTS = 2;
const EXTRA_TEXT_SLOT_HEIGHT = 44;
const COMPOSER_VERTICAL_PADDING = 4;
const INPUT_FONT_SIZE = 18;
const INPUT_LINE_HEIGHT = 22;
const INPUT_VERTICAL_PADDING = 10;
const INPUT_FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const isImageLikeFile = (file: File) => {
  if (file.type?.startsWith('image/')) return true;

  const lowerName = file.name?.toLowerCase() || '';
  return (
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.gif') ||
    lowerName.endsWith('.webp') ||
    lowerName.endsWith('.bmp') ||
    lowerName.endsWith('.svg')
  );
};

const makeAttachmentId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function CommunityComposer({
  isDarkMode,
  backgroundColor
}: CommunityComposerProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [inputMeasureWidth, setInputMeasureWidth] = React.useState(0);
  const [attachedImages, setAttachedImages] = React.useState<AttachedImage[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const dropZoneRef = React.useRef<View | null>(null);
  const attachedImagesRef = React.useRef<AttachedImage[]>([]);
  const textMeasureElementRef = React.useRef<HTMLDivElement | null>(null);

  const webInputFocusResetStyle =
    Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          outlineColor: 'transparent',
          boxShadow: 'none'
        } as any)
      : null;

  const hasAttachments = attachedImages.length > 0;
  const isSendEnabled = inputValue.trim().length > 0;
  const explicitLineCount = React.useMemo(() => Math.max(1, inputValue.split('\n').length), [inputValue]);
  const measuredLineCount = React.useMemo(() => {
    if (inputValue.length === 0) return 1;
    if (Platform.OS !== 'web') return explicitLineCount;
    if (typeof document === 'undefined' || inputMeasureWidth <= 0) return explicitLineCount;

    if (!textMeasureElementRef.current) {
      const measureDiv = document.createElement('div');
      measureDiv.setAttribute('aria-hidden', 'true');
      measureDiv.style.position = 'fixed';
      measureDiv.style.left = '-9999px';
      measureDiv.style.top = '-9999px';
      measureDiv.style.opacity = '0';
      measureDiv.style.pointerEvents = 'none';
      measureDiv.style.zIndex = '-1';
      measureDiv.style.whiteSpace = 'pre-wrap';
      measureDiv.style.wordBreak = 'break-word';
      measureDiv.style.overflowWrap = 'break-word';
      measureDiv.style.margin = '0';
      measureDiv.style.padding = '0';
      measureDiv.style.border = '0';
      measureDiv.style.boxSizing = 'border-box';
      measureDiv.style.fontFamily = INPUT_FONT_FAMILY;
      measureDiv.style.fontSize = `${INPUT_FONT_SIZE}px`;
      measureDiv.style.fontWeight = '400';
      measureDiv.style.lineHeight = `${INPUT_LINE_HEIGHT}px`;
      measureDiv.style.paddingTop = `${INPUT_VERTICAL_PADDING}px`;
      measureDiv.style.paddingBottom = `${INPUT_VERTICAL_PADDING}px`;
      document.body.appendChild(measureDiv);
      textMeasureElementRef.current = measureDiv;
    }

    const measureDiv = textMeasureElementRef.current;
    measureDiv.style.width = `${Math.max(1, inputMeasureWidth)}px`;

    const measureHeight = (value: string) => {
      measureDiv.textContent = value.endsWith('\n') ? value + ' ' : value;
      return Math.max(1, measureDiv.getBoundingClientRect().height);
    };

    const verticalPadding = INPUT_VERTICAL_PADDING * 2;
    const currentHeight = measureHeight(inputValue) - verticalPadding;
    const estimatedLines = Math.max(1, Math.ceil(currentHeight / INPUT_LINE_HEIGHT));

    return estimatedLines;
  }, [explicitLineCount, inputMeasureWidth, inputValue]);

  const textLineSlots = Math.min(3, measuredLineCount);
  const imageSlots = hasAttachments ? 2 : 0;
  const totalSlots = textLineSlots + imageSlots;
  const textRowHeight = EXTRA_TEXT_SLOT_HEIGHT * textLineSlots;
  const composerHeight = EXTRA_TEXT_SLOT_HEIGHT * totalSlots + COMPOSER_VERTICAL_PADDING;

  const revokeAttachment = React.useCallback((image: AttachedImage) => {
    if (!image.revocable || typeof URL === 'undefined') return;
    URL.revokeObjectURL(image.uri);
  }, []);

  const attachDroppedUri = React.useCallback((uri?: string | null) => {
    if (!uri) return;

    setAttachedImages((prev) => {
      if (prev.length >= MAX_ATTACHMENTS) return prev;
      return [...prev, { id: makeAttachmentId(), uri, revocable: false }];
    });
  }, []);

  const attachDroppedImage = React.useCallback((files?: FileList | null) => {
    if (!files || files.length === 0 || typeof URL === 'undefined') return;

    setAttachedImages((prev) => {
      const available = Math.max(0, MAX_ATTACHMENTS - prev.length);
      if (available === 0) return prev;

      const nextImages = Array.from(files)
        .filter(isImageLikeFile)
        .slice(0, available)
        .map((file) => ({
          id: makeAttachmentId(),
          uri: URL.createObjectURL(file),
          revocable: true
        }));

      if (nextImages.length === 0) return prev;
      return [...prev, ...nextImages];
    });
  }, []);

  const extractDropUri = React.useCallback((transfer?: DataTransfer | null) => {
    if (!transfer) return null;
    const uri = transfer.getData('text/uri-list') || transfer.getData('text/plain');
    if (!uri) return null;

    const trimmed = uri.trim();
    if (
      trimmed.startsWith('https://') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('data:image/')
    ) {
      return trimmed;
    }

    return null;
  }, []);

  const clearAttachedImage = React.useCallback(
    (id: string) => {
      setAttachedImages((prev) => {
        const target = prev.find((image) => image.id === id);
        if (target) {
          revokeAttachment(target);
        }
        return prev.filter((image) => image.id !== id);
      });
    },
    [revokeAttachment]
  );

  React.useEffect(() => {
    attachedImagesRef.current = attachedImages;
  }, [attachedImages]);

  React.useEffect(() => {
    return () => {
      attachedImagesRef.current.forEach(revokeAttachment);
    };
  }, [revokeAttachment]);

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    return () => {
      const textarea = textMeasureElementRef.current;
      if (textarea) {
        textarea.remove();
        textMeasureElementRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const preventBrowserFileOpen = (event: DragEvent) => {
      const transfer = event.dataTransfer;
      const hasFiles = !!transfer && Array.from(transfer.types || []).includes('Files');
      if (!hasFiles) return;

      event.preventDefault();
    };

    window.addEventListener('dragover', preventBrowserFileOpen);
    window.addEventListener('drop', preventBrowserFileOpen);

    return () => {
      window.removeEventListener('dragover', preventBrowserFileOpen);
      window.removeEventListener('drop', preventBrowserFileOpen);
    };
  }, []);

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const node = dropZoneRef.current as unknown as HTMLElement | null;
    if (!node || typeof node.addEventListener !== 'function') return;

    const isFileDrag = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types || []).includes('Files');

    const onDragEnter = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(true);
    };

    const onDragOver = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(true);
    };

    const onDragLeave = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
    };

    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        attachDroppedImage(files);
        return;
      }

      const droppedUri = extractDropUri(event.dataTransfer);
      attachDroppedUri(droppedUri);
    };

    node.addEventListener('dragenter', onDragEnter);
    node.addEventListener('dragover', onDragOver);
    node.addEventListener('dragleave', onDragLeave);
    node.addEventListener('drop', onDrop);

    return () => {
      node.removeEventListener('dragenter', onDragEnter);
      node.removeEventListener('dragover', onDragOver);
      node.removeEventListener('dragleave', onDragLeave);
      node.removeEventListener('drop', onDrop);
    };
  }, [attachDroppedImage, attachDroppedUri, extractDropUri]);

  const dropZoneProps =
    Platform.OS === 'web'
      ? ({
          onDragOver: (event: any) => {
            event.preventDefault();
            event.stopPropagation?.();
            setIsDragOver(true);
          },
          onDragLeave: () => {
            setIsDragOver(false);
          },
          onDrop: (event: any) => {
            event.preventDefault();
            event.stopPropagation?.();
            setIsDragOver(false);

            const files =
              (event?.dataTransfer?.files as FileList | undefined) ||
              (event?.nativeEvent?.dataTransfer?.files as FileList | undefined);
            if (files && files.length > 0) {
              attachDroppedImage(files);
              return;
            }

            const droppedUri = extractDropUri(
              (event?.dataTransfer as DataTransfer | undefined) ||
                (event?.nativeEvent?.dataTransfer as DataTransfer | undefined) ||
                null
            );
            attachDroppedUri(droppedUri);
          },
          onDropCapture: (event: any) => {
            event.preventDefault();
            event.stopPropagation?.();
          }
        } as any)
      : {};

  return (
    <View style={styles.composerOuter}>
      <View
        ref={dropZoneRef}
        style={[
          styles.composerInner,
          isDarkMode && styles.composerInnerDark,
          hasAttachments && styles.composerInnerExpanded,
          { backgroundColor, height: composerHeight },
          isInputFocused && (isDarkMode ? styles.composerInnerFocusedDark : styles.composerInnerFocused),
          isDragOver && styles.composerInnerDragOver
        ]}
        {...dropZoneProps}
      >
        {hasAttachments && (
          <View style={styles.attachmentPreviewRow}>
            {attachedImages.map((image, index) => (
              <View
                key={image.id}
                style={[
                  styles.attachmentPreviewWrap,
                  index < attachedImages.length - 1 && styles.attachmentPreviewGap
                ]}
              >
                <Image source={{ uri: image.uri }} style={styles.attachmentPreview} resizeMode="contain" />
                <Pressable
                  style={[
                    styles.attachmentRemoveButton,
                    isDarkMode && styles.attachmentRemoveButtonDark
                  ]}
                  onPress={() => clearAttachedImage(image.id)}
                >
                  <Ionicons name="close" size={14} color={isDarkMode ? '#e5e7eb' : '#111827'} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.composerBottomRow, { height: textRowHeight }]}>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            onLayout={(event) => {
              const width = event?.nativeEvent?.layout?.width;
              if (typeof width === 'number' && width > 0) {
                setInputMeasureWidth(width);
              }
            }}
            multiline
            scrollEnabled={false}
            onFocus={(event: any) => {
              setIsInputFocused(true);

              if (Platform.OS === 'web') {
                const target = event?.target;
                if (target && target.style) {
                  target.style.outline = 'none';
                  target.style.boxShadow = 'none';
                  target.style.border = '0';
                }
              }
            }}
            onBlur={() => setIsInputFocused(false)}
            placeholder="입력을 시작하세요..."
            placeholderTextColor={isDarkMode ? '#8f96a3' : '#94a3b8'}
            style={[styles.composerInput, isDarkMode && styles.composerInputDark, webInputFocusResetStyle]}
          />
          <View style={styles.composerRight}>
            <Pressable
              disabled={!isSendEnabled}
              style={[
                styles.submitButton,
                isDarkMode && styles.submitButtonDark,
                isSendEnabled && (isDarkMode ? styles.submitButtonActiveDark : styles.submitButtonActive)
              ]}
            >
              <Ionicons
                name="arrow-forward"
                size={32}
                style={styles.submitIcon}
                color={isDarkMode ? (isSendEnabled ? '#ffffff' : '#9aa1ad') : '#000000'}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  composerOuter: {
    paddingHorizontal: 18,
    paddingBottom: 18
  },
  composerInner: {
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 18,
    paddingRight: 14,
    paddingVertical: 2
  },
  composerInnerFocused: {
    borderColor: '#475569'
  },
  composerInnerExpanded: {
    justifyContent: 'flex-start'
  },
  composerInnerDragOver: {
    borderColor: '#60a5fa'
  },
  composerInnerDark: {
    borderColor: '#36363B'
  },
  composerInnerFocusedDark: {
    borderColor: '#e8eaed'
  },
  attachmentPreviewRow: {
    width: '100%',
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  attachmentPreviewWrap: {
    width: 132,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 0,
    position: 'relative',
    backgroundColor: '#0f172a14'
  },
  attachmentPreviewGap: {
    marginRight: 8
  },
  attachmentPreview: {
    width: '100%',
    height: '100%'
  },
  attachmentRemoveButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffcc',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  attachmentRemoveButtonDark: {
    backgroundColor: '#111827cc',
    borderColor: '#36363B'
  },
  composerBottomRow: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    fontSize: INPUT_FONT_SIZE,
    lineHeight: INPUT_LINE_HEIGHT,
    color: '#0f172a',
    paddingTop: INPUT_VERTICAL_PADDING,
    paddingBottom: INPUT_VERTICAL_PADDING,
    borderWidth: 0,
    textAlignVertical: 'top'
  },
  composerInputDark: {
    color: '#d1d5db'
  },
  composerRight: {
    marginLeft: 10,
    marginBottom: 4,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButton: {
    width: 32,
    height: 33.5,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb'
  },
  submitButtonDark: {
    backgroundColor: '#f3f4f6'
  },
  submitButtonActive: {
    backgroundColor: '#2563eb'
  },
  submitButtonActiveDark: {
    backgroundColor: '#3b82f6'
  },
  submitIcon: {
    width: 32,
    height: 33.5,
    lineHeight: 33.5,
    textAlign: 'center'
  }
});
