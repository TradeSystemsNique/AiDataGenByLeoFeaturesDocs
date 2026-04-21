//+------------------------------------------------------------------+
//|                                                       Global.mqh |
//|                                  Copyright 2026, Niquel Mendoza. |
//|                          https://www.mql5.com/es/users/nique_372 |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Niquel Mendoza."
#property link      "https://www.mql5.com/es/users/nique_372"
#property strict

#ifndef GLOBAL_MQH
#define GLOBAL_MQH

//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
#include "Secrets.mqh"

//---
// Archivo Global.mqh
// Mencionar que como tal no operaremos
// Esto es mas un archivos de ayuda para evirar crear otro parser (sin que este cree features)
//.. dado que estamos usando el "compilador" de aidatagenbyleo
// Entonces este trae todas sus depenecias como la libreira ict\news por loq ue tenemos que setearlas para uqe no nos den errores
// Igualmente no consumiran casi nada

//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
#include <TSN\\MQLArticles\\Utils\\TFManager.mqh>

//---
CNewBarManager g_new_bar_manager;

//---
#define TSN_ICTLIBRARY_INSTANCE_BAR_MANAGER g_new_bar_manager

//--- Defines para limpieza de bloques
#define AIDATALEO_FEAUTRE_CLEAN_GEN(Timeframe, Frecuencia) \
  if(Timeframe<PERIOD_M30) Frecuencia = BASICEVENT_REG_FLAG_ON_NEW_WEEK; \
  else if(Timeframe<PERIOD_H2) Frecuencia = BASICEVENT_REG_FLAG_ON_NEW_MON;


#define AIDATALEO_FEATURE_CLEAN_BB
#define AIDATALEO_FEATURE_CLEAN_OB

//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
//--- Incluimos la libreria ICT
#include <TSN\\ICTLibrary\\ICTConcepts.mqh>
#include <TSN\\ICTLibrary\\Liquidity.mqh>
#include <TSN\\ICTLibrary\\Pda.mqh>

//--- Incluiremos las librerias de eventos principales y el autocleaner
#include <TSN\\MQLArticles\\Utils\\FA\\AutoDelete.mqh>

//--- Incluiremos las noticas
#include <TSN\\FastNL\\Main.mqh>
CEconomicCalendar g_calendar;
EconomicEventPorcentage g_calendar_events[];

// Definimos la instancia del calendario
#define AILEO_ECONOMIC_CALENDAR_INSTANCE g_calendar

//--- Incluiremos las librerias de data
#include <TSN\\AiDataGen\\GenericData\\AllFeatures.mqh>

//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
class CGlobalInit
 {
private:
  static bool        init;

public:
  //--- Incializacion global
                     CGlobalInit(void)
   {
    if(init)
      return;

    //--- Llamamos una unica vez a la funcion de incilzaicion
#ifdef TSN_ICTLIB_FUNC_CTS
    TSN_ICTLIB_FUNC_CTS(THE_BOT_PLACE_USER_ID);
#else
    ICTGen_Init(THE_BOT_PLACE_USER_ID);
#endif // TSN_ICTLIB_FUNC_CTS

    CBasicEvents::Init();
    CNewsEvents::Init();

    //--- Seteasmos el bar manager
    ICTGen_BarManagerSet(&g_new_bar_manager); // Le damos a la libreira ICT el manager

    //--- Inciamos pool
    CIctLibPool::Init();
    CIctLibAtrManager::Init();
    CIndicatorCache::Init();

    //--- Solo añadimos en CASO de que DEFGLOBAL_SIMPLE NO ESTE DEFINIDIO
    // Util para los ejemplos BASE.. en los cuales no hace falta usar CAutoCleaner debido a la simplicidad
    //CAutoCleaner::AddFunction(CAccountStatus_Deinit); no lo usremos
    // las demas las definod dado que se estaran crenado punteros "que no se usan"
    // Asi que ellas las limpirasn
    CAutoCleaner::AddFunction(CBasicEvents::Deinit);
    CAutoCleaner::AddFunction(ICTGen_OnDeinitEvent);
    CAutoCleaner::AddFunction(CNewsEvents::Deinit);

    //--- Limpieza de los Pools
    CAutoCleaner::AddFunction(CIctLibPool::Deinit);
    CAutoCleaner::AddFunction(CIctLibAtrManager::Deinit);
    CAutoCleaner::AddFunction(CIndicatorCache::Deinit);
    
    //--- Factory creators
    CAutoCleaner::AddFunction(CAiDataGenFeatureFactory::Deinit);

    //---
    init = true;
   }
  //--- Deinicializacion global
                    ~CGlobalInit(void) {}
 };

//+------------------------------------------------------------------+
bool CGlobalInit::init = false;

//+------------------------------------------------------------------+
CGlobalInit g_global_instance;
//+------------------------------------------------------------------+
#endif // GLOBAL_MQH
