export const fonts = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const getFontFamily = (weight = 'regular') => {
  return fonts[weight];
};

// Helper function to get font style object
export const getFontStyle = (weight = 'regular') => {
  return {
    fontFamily: fonts[weight],
  };
};

