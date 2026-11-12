import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  selectedValue: string;
  onValueChange: (itemValue: string) => void;
  options: Option[];
  disabled?: boolean;
}

let activeSelectId: symbol | null = null;
const selectListeners = new Set<(id: symbol | null) => void>();

const notifySelectOpened = (id: symbol | null) => {
  activeSelectId = id;
  selectListeners.forEach((listener) => listener(id));
};

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
  disabled = false,
}) => {
  const selectId = useRef(Symbol('FormSelect')).current;
  const triggerRef = useRef<View>(null);
  const overlayRef = useRef<View>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 50,
  });
  const [overlayOffset, setOverlayOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleActiveChange = (openedId: symbol | null) => {
      if (openedId !== selectId) {
        setIsOpen(false);
      }
    };

    selectListeners.add(handleActiveChange);
    return () => {
      selectListeners.delete(handleActiveChange);
      if (activeSelectId === selectId) {
        activeSelectId = null;
      }
    };
  }, [selectId]);

  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
      if (activeSelectId === selectId) {
        notifySelectOpened(null);
      }
    }
  }, [disabled, isOpen, selectId]);

  const selectedLabel =
    options.find((opt) => opt.value === selectedValue)?.label ||
    options[0]?.label ||
    'Selecione...';

  const handleOpen = () => {
    if (disabled) return;
    Keyboard.dismiss();

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPos({ x, y, width, height });
      notifySelectOpened(selectId);
      setIsOpen(true);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    if (activeSelectId === selectId) {
      notifySelectOpened(null);
    }
  };

  const handleSelect = (value: string) => {
    onValueChange(value);
    handleClose();
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-1 text-gray-700">{label}</Text>

      <View ref={triggerRef} collapsable={false} className="w-full">
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={disabled}
          onPress={handleOpen}
          className={`border border-gray-300 rounded-lg h-[50px] px-3.5 flex-row items-center justify-center relative ${
            disabled ? 'bg-gray-100 opacity-70' : 'bg-white'
          }`}
        >
          <View className="absolute left-3.5">
            <Feather name="chevron-down" size={18} color={disabled ? '#9CA3AF' : '#4B5563'} />
          </View>
          <Text
            numberOfLines={1}
            className={`text-sm font-bold ml-5 ${disabled ? 'text-gray-400' : 'text-[#111827]'}`}
          >
            {selectedLabel}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen && !disabled}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <Pressable
          ref={overlayRef}
          onPress={handleClose}
          onLayout={() => {
            overlayRef.current?.measureInWindow((ox, oy) => {
              setOverlayOffset({ x: ox, y: oy });
            });
          }}
          className="flex-1"
        >
          <View
            style={{
              position: 'absolute',
              top: dropdownPos.y - overlayOffset.y,
              left: dropdownPos.x - overlayOffset.x,
              width: dropdownPos.width,
              elevation: 20,
            }}
            className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg"
          >
            {options.map((option, index) => {
              const isFirst = index === 0;
              const isLast = index === options.length - 1;
              const isSelected = option.value === selectedValue;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(option.value)}
                  className={`min-h-[50px] px-3.5 py-2.5 flex-row items-center justify-center relative ${
                    isSelected ? 'bg-[#E3F3EC]/60' : 'bg-white'
                  } ${!isLast ? 'border-b border-gray-200' : ''}`}
                >
                  {isFirst && (
                    <View className="absolute left-3.5">
                      <Feather name="chevron-down" size={18} color="#4B5563" />
                    </View>
                  )}
                  <Text
                    numberOfLines={1}
                    className={`text-sm font-bold text-center ${
                      isSelected ? 'text-[#00623B]' : 'text-[#111827]'
                    } ${isFirst ? 'ml-5' : ''}`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
