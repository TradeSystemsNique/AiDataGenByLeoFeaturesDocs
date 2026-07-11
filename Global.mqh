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

//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
//--- Incluiremos las librerias de eventos principales y el autocleaner
#include <TSN\\MQLArticles\\Utils\\TFManager.mqh>
#include <TSN\\MQLArticles\\Utils\\FA\\AutoDelete.mqh>
#include <TSN\\AiDataGen\\GenericData\\Complex.mqh>


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
    CAutoCleaner::AddFunction(TSN::CAiDataGenFeatureFactory::Deinit);

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
