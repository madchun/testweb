import React from 'react';
import { StyleOption } from '../types';

interface StyleSelectionProps {
  capturedImage: string;
  onSelectStyle: (style: StyleOption) => void;
  onRetake: () => void;
}

// Predefined style options
const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'astronaut',
    name: 'Astronaut',
    description: 'Space explorer in full gear',
    prompt: 'Transform this person into a professional astronaut in a detailed space suit, floating in space with Earth visible in the background. Make it look realistic and inspiring, like an official NASA portrait.',
    icon: '🚀',
  },
  {
    id: 'doctor',
    name: 'Doctor',
    description: 'Medical professional',
    prompt: 'Transform this person into a professional doctor in a white coat with a stethoscope, standing in a modern hospital setting. Make it look professional and trustworthy, suitable for a medical professional portrait.',
    icon: '⚕️',
  },
  {
    id: 'scientist',
    name: 'Scientist',
    description: 'Lab researcher',
    prompt: 'Transform this person into a scientist in a lab coat, working in a modern laboratory with scientific equipment in the background. Make it look professional and intelligent, like a research professional portrait.',
    icon: '🔬',
  },
  {
    id: 'chef',
    name: 'Chef',
    description: 'Master culinary artist',
    prompt: 'Transform this person into a professional chef in a white chef uniform with a toque, in a modern kitchen. Make it look professional and artistic, like a culinary master portrait.',
    icon: '👨‍🍳',
  },
  {
    id: 'pilot',
    name: 'Pilot',
    description: 'Commercial airline captain',
    prompt: 'Transform this person into a professional airline pilot in full captain uniform, standing in front of an aircraft. Make it look professional and confident, like an official airline captain portrait.',
    icon: '✈️',
  },
  {
    id: 'artist',
    name: 'Artist',
    description: 'Creative painter',
    prompt: 'Transform this person into a creative artist in an art studio, surrounded by paintings and art supplies. Make it look artistic and inspiring, like a professional artist portrait.',
    icon: '🎨',
  },
  {
    id: 'superhero',
    name: 'Superhero',
    description: 'Marvel-style hero',
    prompt: 'Transform this person into a superhero with a cool costume and cape, in a heroic pose with a city skyline in the background. Make it look epic and powerful, like a movie poster.',
    icon: '🦸',
  },
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'Magical sorcerer',
    prompt: 'Transform this person into a powerful wizard with robes and a staff, in a magical setting with glowing effects. Make it look mystical and enchanting, like a fantasy movie character.',
    icon: '🧙',
  },
  {
    id: 'rockstar',
    name: 'Rock Star',
    description: 'Music legend',
    prompt: 'Transform this person into a rock star with cool stage outfit and guitar, performing on stage with dramatic lighting. Make it look energetic and cool, like a concert poster.',
    icon: '🎸',
  },
];

export const StyleSelection: React.FC<StyleSelectionProps> = ({
  capturedImage,
  onSelectStyle,
  onRetake,
}) => {
  return (
    <div className="w-full h-full flex bg-background overflow-hidden">
      {/* Left Side - Preview Image */}
      <div className="w-1/3 bg-gray-900 flex items-center justify-center p-8">
        <div className="space-y-4">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full rounded-lg shadow-2xl"
          />
          <button
            onClick={onRetake}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg"
          >
            🔄 Retake Photo
          </button>
        </div>
      </div>

      {/* Right Side - Style Selection */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-primary mb-2">
              Choose Your Style
            </h2>
            <p className="text-xl text-gray-600">
              Select a style to transform your photo with AI
            </p>
          </div>

          {/* Style Grid */}
          <div className="grid grid-cols-3 gap-6">
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style.id}
                onClick={() => onSelectStyle(style)}
                className="bg-white hover:bg-secondary hover:text-gray-900 border-2 border-gray-200 hover:border-secondary rounded-xl p-6 transition-all duration-200 transform hover:scale-105 hover:shadow-xl text-left"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="text-5xl">{style.icon}</div>
                  <h3 className="text-2xl font-bold">{style.name}</h3>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
