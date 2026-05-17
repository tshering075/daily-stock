import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import {
  displayToIsoDate,
  formatDisplayDate,
  isoToDisplayDate,
  parseDisplayDate,
} from '@/lib/date-format';

type DateFieldProps = {
  width: number;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function DateField({
  width,
  value,
  editable,
  onChange,
  placeholder = 'DD/MM/YYYY',
}: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [draftDate, setDraftDate] = useState(() => parseDisplayDate(value) ?? new Date());

  const parsed = parseDisplayDate(value);

  useEffect(() => {
    if (showPicker) {
      setDraftDate(parseDisplayDate(value) ?? new Date());
    }
  }, [showPicker, value]);

  const openPicker = () => {
    if (!editable) return;
    setDraftDate(parsed ?? new Date());
    setShowPicker(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && date) {
      onChange(formatDisplayDate(date));
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, { width }]}>
        {/* @ts-expect-error web-only date input */}
        <input
          type="date"
          value={displayToIsoDate(value)}
          disabled={!editable}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(isoToDisplayDate(e.target.value));
          }}
          style={{
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            height: 38,
            boxSizing: 'border-box',
            borderRadius: 8,
            border: `1px solid ${AppTheme.colors.border}`,
            backgroundColor: AppTheme.colors.surfaceMuted,
            paddingLeft: 6,
            paddingRight: 6,
            fontSize: 13,
            color: AppTheme.colors.text,
            fontFamily: 'system-ui, sans-serif',
            opacity: editable ? 1 : 0.6,
          }}
        />
      </View>
    );
  }

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.field,
          pressed && editable && styles.fieldPressed,
          !editable && styles.fieldDisabled,
        ]}
        onPress={openPicker}
        disabled={!editable}
        accessibilityRole="button"
        accessibilityLabel="Select date">
        <Text style={value ? styles.valueText : styles.placeholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={15}
          color={AppTheme.colors.textSecondary}
          style={styles.calendarIcon}
        />
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide">
          <Pressable style={styles.modalBackdrop} onPress={() => setShowPicker(false)}>
            <Pressable style={styles.iosSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.iosToolbar}>
                <Pressable onPress={() => setShowPicker(false)} hitSlop={12}>
                  <Text style={styles.iosCancel}>Cancel</Text>
                </Pressable>
                <Text style={styles.iosTitle}>Select date</Text>
                <Pressable
                  onPress={() => {
                    onChange(formatDisplayDate(draftDate));
                    setShowPicker(false);
                  }}
                  hitSlop={12}>
                  <Text style={styles.iosDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                onChange={(_, date) => {
                  if (date) setDraftDate(date);
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    flexShrink: 0,
    justifyContent: 'center',
  },
  field: {
    width: '100%',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 8,
    minHeight: 38,
    overflow: 'hidden',
  },
  fieldPressed: {
    backgroundColor: AppTheme.colors.surface,
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  calendarIcon: {
    flexShrink: 0,
  },
  valueText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 12,
    color: AppTheme.colors.text,
  },
  placeholder: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 12,
    color: '#94a3b8',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  iosSheet: {
    backgroundColor: AppTheme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  iosToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  iosTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  iosCancel: {
    fontSize: 16,
    color: AppTheme.colors.textSecondary,
  },
  iosDone: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.colors.primary,
  },
});
