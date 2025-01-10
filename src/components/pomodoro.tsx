import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { BearIcon } from './bear-icon.tsx';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';

const ALARM_SOUND_URL = './shari_meow-47485.mp3';

export const Pomodoro: React.FunctionComponent = () => {
  const [time, setTime] = useState(loadFromLocalStorage('pomodoroTime', 25 * 60));
  const [breakTime, setBreakTime] = useState(loadFromLocalStorage('pomodoroBreakTime', 5 * 60));
  const [isActive, setIsActive] = useState(loadFromLocalStorage('pomodoroIsActive', false));
  const [isBreak, setIsBreak] = useState(loadFromLocalStorage('pomodoroIsBreak', false));
  const [inputTime, setInputTime] = useState(loadFromLocalStorage('pomodoroInputTime', 25));
  const [inputBreakTime, setInputBreakTime] = useState(loadFromLocalStorage('pomodoroInputBreakTime', 5));
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef(new Audio(ALARM_SOUND_URL));

  useEffect(() => {
    saveToLocalStorage('pomodoroTime', time);
    saveToLocalStorage('pomodoroBreakTime', breakTime);
    saveToLocalStorage('pomodoroIsActive', isActive);
    saveToLocalStorage('pomodoroIsBreak', isBreak);
    saveToLocalStorage('pomodoroInputTime', inputTime);
    saveToLocalStorage('pomodoroInputBreakTime', inputBreakTime);
  }, [time, breakTime, isActive, isBreak, inputTime, inputBreakTime]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setIsBreak(false);
    setTime(inputTime * 60);
    setBreakTime(inputBreakTime * 60);
  }, [inputTime, inputBreakTime]);

  const playAlarm = useCallback(() => {
    try {
      audioRef.current.src = ALARM_SOUND_URL;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Audio playback failed:', error);
      });
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }, []);

  const showNotification = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(isBreak ? '¡Tiempo de trabajo!' : '¡Tiempo de descanso!', {
        body: isBreak ? 'Tu descanso ha terminado.' : 'Es hora de tomar un descanso.',
        icon: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showNotification();
        }
      });
    }
  }, [isBreak]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        if (isBreak) {
          setBreakTime((prev) => {
            if (prev <= 1) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setIsBreak(false);
              setTime(inputTime * 60);
              playAlarm();
              showNotification();
              return inputBreakTime * 60;
            }
            return prev - 1;
          });
        } else {
          setTime((prev) => {
            if (prev <= 1) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setIsBreak(true);
              setBreakTime(inputBreakTime * 60);
              playAlarm();
              showNotification();
              return inputTime * 60;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
  
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isBreak, inputTime, inputBreakTime, playAlarm, showNotification]);
  
  const toggleTimer = () => {
    setIsActive(prev => !prev);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setInputTime(value);
      if (!isActive && !isBreak) {
        setTime(value * 60);
      }
    }
  };

  const handleBreakTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setInputBreakTime(value);
      if (!isActive && isBreak) {
        setBreakTime(value * 60);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
     const blinkInterval = setInterval(() => {
       const bearIcon = document.querySelector('.bear-icon');
       if (bearIcon) {
         bearIcon.classList.add('blink');
         setTimeout(() => {
           bearIcon.classList.remove('blink');
         }, 200);
       }
     }, 5000);

     return () => clearInterval(blinkInterval);
   }, []);

  return (
    <div className="w-full md:w-72 bg-purple-800 p-4 rounded-lg shadow-xl">
      <h2 className="text-lg font-bold mb-4 text-purple-100">
        {isBreak ? 'Tiempo de descanso' : 'Pomodoro'}
      </h2>
      <div className="flex flex-col items-center">
        <div className="text-5xl font-bold mb-6 text-purple-100 tabular-nums">
          {isBreak ? formatTime(breakTime) : formatTime(time)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 w-full">
          <div>
            <label className="block text-sm text-purple-300 mb-1">Trabajo (min)</label>
            <input
              type="number"
              value={inputTime}
              onChange={handleTimeChange}
              className="p-2 rounded-md border w-full text-center bg-purple-700 text-purple-100 border-purple-600 focus:outline-none focus:border-purple-500"
              min="1"
              disabled={isActive}
            />
          </div>
          <div>
            <label className="block text-sm text-purple-300 mb-1">Descanso (min)</label>
            <input
              type="number"
              value={inputBreakTime}
              onChange={handleBreakTimeChange}
              className="p-2 rounded-md border w-full text-center bg-purple-700 text-purple-100 border-purple-600 focus:outline-none focus:border-purple-500"
              min="1"
              disabled={isActive}
            />
          </div>
        </div>

        <div className="flex space-x-3 mb-6">
          <button
            onClick={toggleTimer}
            className={`${
              isActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white px-6 py-3 rounded-md transition-colors`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={resetTimer}
            className="bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        <div className="mt-2 text-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: time === 0 || breakTime === 0 ? Infinity : 0,
              repeatDelay: 1
            }}
          >
            <BearIcon className="bear-icon" />
          </motion.div>
          <p className="text-purple-300 mt-3">
            {isBreak 
              ? '¡Toma un descanso!' 
              : '¡Ánimo! Sigue trabajando'}
          </p>
        </div>
      </div>
    </div>
  );
};

