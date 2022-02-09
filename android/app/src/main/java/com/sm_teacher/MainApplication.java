package com.sm_teacher;

import android.app.Application;

import com.facebook.react.ReactApplication;
import ch.milosz.reactnative.RNZoomUsPackage;
import ui.photoeditor.RNPhotoEditorPackage;
import com.azendoo.reactnativesnackbar.SnackbarPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.kishanjvaghela.cardview.RNCardViewPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.rnfs.RNFSPackage;
import com.vinzscam.reactnativefileviewer.RNFileViewerPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;

import org.pgsqlite.SQLitePluginPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNZoomUsPackage(),
            new RNPhotoEditorPackage(),
            new SnackbarPackage(),
            new LinearGradientPackage(),
            new RNFetchBlobPackage(),
            new VectorIconsPackage(),
            new NetInfoPackage(),
            new RNCardViewPackage(),
          new RNDeviceInfo(),
          new RNGestureHandlerPackage(),
          new DocumentPickerPackage(), 
          new PickerPackage(),
          new AsyncStoragePackage(),
          new RNFileViewerPackage(),
          new RNFSPackage(),
          new RNCWebViewPackage(),
          new SQLitePluginPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
